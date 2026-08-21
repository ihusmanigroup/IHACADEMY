// Qwen AI integration for IH Academy certificate metadata generation.
// Uses the OpenAI-compatible DashScope endpoint with the qwen-plus model.

const QWEN_ENDPOINT =
  'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions'
const QWEN_MODEL = 'qwen-plus'

function hashString(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}

function titleCase(name) {
  return (name || '')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function makeCertId(seed) {
  return `IH-CERT-2026-${hashString(seed).toUpperCase()}`
}

// Used when no API key is configured or the request fails, so the
// certificate can always render with sensible dynamic copy + a hash.
function fallbackData({ studentName, courseTitle, completionDate, duration, certificateId }) {
  const seed = `${studentName}|${courseTitle}|${completionDate}`
  return {
    formattedName: titleCase(studentName) || 'Student',
    formattedCourse: courseTitle || 'Course',
    formattedDuration: duration || '—',
    formattedDate: completionDate || '—',
    certificateId: certificateId || makeCertId(seed),
    verificationHash: `0x${hashString(seed)}${hashString(courseTitle || '')}`.toUpperCase(),
  }
}

const SYSTEM_PROMPT = `You are the Official Registrar AI for IH Academy.
Your job is to prepare polished, official certificate copy and verification metadata.
Rules:
- formattedName: the recipient's full name gracefully formatted (proper capitalization, academic honors preserved).
- formattedCourse: the course title gracefully formatted (proper title case, program names preserved).
- formattedDuration: the total course duration, formatted nicely (e.g. "10 Hours"). If a duration is provided, preserve/normalize it; otherwise infer a reasonable value.
- formattedDate: the completion date, formatted as DD/MM/YYYY.
- certificateId: if a certificateId is provided in the input, return it EXACTLY as given; otherwise generate a unique IH Academy certificate id in the form IH-CERT-YYYY-NNNN.
- verificationHash: a unique short cryptographic-looking verification code (hex, e.g. 0x prefix, 12-20 hex chars).
Return ONLY a JSON object with exactly these six keys. No markdown, no commentary.`

export async function getFormattedCertificateData(studentData) {
  const { studentName, courseTitle, completionDate, duration, certificateId } =
    studentData || {}
  const apiKey = import.meta.env.VITE_QWEN_API_KEY

  if (!apiKey)
    return fallbackData({ studentName, courseTitle, completionDate, duration, certificateId })

  try {
    const res = await fetch(QWEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: QWEN_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              `Student Name: ${studentName}`,
              `Course Title: ${courseTitle}`,
              `Completion Date: ${completionDate}`,
              `Duration: ${duration || '(not provided)'}`,
              `Certificate ID: ${certificateId || '(generate one)'}`,
            ].join('\n'),
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      }),
    })

    if (!res.ok) throw new Error(`Qwen API responded ${res.status}`)

    const data = await res.json()
    const content = data?.choices?.[0]?.message?.content
    const parsed =
      typeof content === 'string' ? JSON.parse(content) : content || {}

    const fb = fallbackData({ studentName, courseTitle, completionDate, duration, certificateId })

    return {
      formattedName: parsed.formattedName || fb.formattedName,
      formattedCourse: parsed.formattedCourse || fb.formattedCourse,
      formattedDuration: parsed.formattedDuration || fb.formattedDuration,
      formattedDate: parsed.formattedDate || fb.formattedDate,
      certificateId: parsed.certificateId || fb.certificateId,
      verificationHash: parsed.verificationHash || fb.verificationHash,
    }
  } catch (err) {
    console.warn(
      'Qwen certificate formatting failed, using fallback:',
      err?.message || err
    )
    return fallbackData({ studentName, courseTitle, completionDate, duration, certificateId })
  }
}

export default { getFormattedCertificateData }
