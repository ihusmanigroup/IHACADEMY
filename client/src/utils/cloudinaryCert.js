const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo'

function safeEncode(text) {
  return encodeURIComponent(encodeURIComponent(text || ''))
}

export function buildCloudinaryCertificateUrl({
  blankTemplateUrl,
  studentName,
  courseTitle,
  duration,
  completionDate,
  certificateId,
}) {
  if (!blankTemplateUrl) return null

  const name = safeEncode(studentName)
  const course = safeEncode(courseTitle)
  const dur = safeEncode(duration)
  const date = safeEncode(completionDate)
  const certId = safeEncode(certificateId)
  const encodedTemplate = encodeURIComponent(blankTemplateUrl)

  return (
    `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/f_auto,q_auto/` +
    `l_text:Arial_44_bold:${name},co_rgb:1D4ED8,g_center,y_-125/` +
    `l_text:Arial_26_bold:${course},co_rgb:0F172A,g_center,y_0/` +
    `l_text:Arial_18_bold:${dur},co_rgb:1E293B,g_center,x_-310,y_160/` +
    `l_text:Arial_18_bold:${date},co_rgb:1E293B,g_center,x_0,y_160/` +
    `l_text:Arial_18_bold:${certId},co_rgb:1E293B,g_center,x_310,y_160/` +
    `${encodedTemplate}`
  )
}