// ---------------------------------------------------------------------------
// IH Academy — direct-to-Cloudinary image upload helper.
//
// Reads the Cloudinary credentials from client .env:
//   VITE_CLOUDINARY_CLOUD_NAME   (e.g. xdu8mnze)
//   VITE_CLOUDINARY_UPLOAD_PRESET (unsigned preset created in Cloudinary →
//                                  Settings → Upload → Upload presets)
//
// Uploads are "unsigned": the preset name is public and safe to ship in the
// client bundle. NEVER put the Cloudinary API secret here — use a signed
// upload endpoint on the server if you need signature-based uploads.
// ---------------------------------------------------------------------------

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || ''
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || ''

/** True when the Cloudinary env vars are configured for uploads. */
export function cloudinaryConfigured() {
  return Boolean(CLOUD_NAME && UPLOAD_PRESET)
}

/**
 * Uploads an image file directly to Cloudinary and returns its HTTPS URL
 * (`secure_url`). Throws a descriptive Error on configuration or request
 * failure so callers can surface it in the UI.
 *
 * @param {File} file         Image file picked by the user.
 * @param {object} [options]  `{ folder }` — Cloudinary folder to store into.
 * @returns {Promise<string>} The secure public URL of the uploaded image.
 */
export async function uploadImageToCloudinary(file, options = {}) {
  if (!cloudinaryConfigured()) {
    throw new Error(
      'Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in client/.env'
    )
  }
  if (!file) throw new Error('No image selected.')

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  if (options.folder) formData.append('folder', options.folder)

  let response
  try {
    response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    })
  } catch {
    throw new Error('Network error while uploading the image.')
  }

  if (!response.ok) {
    let message = `Cloudinary upload failed (${response.status}).`
    try {
      const body = await response.json()
      if (body?.error?.message) message = `Cloudinary: ${body.error.message}`
    } catch {
      // Non-JSON error body — keep the generic message.
    }
    throw new Error(message)
  }

  const data = await response.json()
  return data?.secure_url || data?.url || null
}