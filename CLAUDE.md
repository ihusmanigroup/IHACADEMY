# IH Academy — Anchored Project Summary

## 1. Project Context (still true)
- **Repo:** `ih-academy` (IH Academy learning platform) on Windows at `C:\Users\HassanUsmani\Desktop\IH USMANI GROUP\IHACADEMY`. Not a git repo.
- **Stack:** Vite + React frontend in `/client`; Supabase (Postgres + Storage) backend. Node is invoked via `D:\node.exe` (use `& "D:\node.exe" ...` in PowerShell).
- **Run from `/client`:** `npm run dev`, `npm run build`, `npm run lint` (oxlint).
- **Key files:**
  - `src/pages/Certifications.jsx` — certifications dashboard, unlock gating, preview/modal launch.
  - `src/components/MinorCourseCertificate.jsx` — certificate modal (canvas-rendered).
  - `src/components/CertificateCanvas.jsx` — HTML5 canvas certificate renderer.
  - `src/services/qwenService.js` — Qwen AI metadata generation.
  - `src/lib/unlockCertificates.js` — strict unlock logic.
  - `src/lib/courseMeta.js`, `src/lib/supabaseClient.js` — course metadata + Supabase client (env `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
- **Backend:** Supabase RPC `get_enrolled_major_ids`, `get_enrolled_minor_courses`; Storage bucket `certificates` (public) holding `minor-certificate-template.jpg`.

## 2. Recent Work Completed (verified)
### Strict Certificate Unlocking (Certifications.jsx + Supabase)
- Certifications page enforces unlock **before** "View Certificate" is enabled.
- Fetches enrolled majors (`get_enrolled_major_ids`) and minor courses (`get_enrolled_minor_courses`), then computes progress.
- Minor progress is **strict**: `completed / total` lessons across **all** minor courses (manually-completed hidden/intro lessons counted as complete).
- Unlock rules (`unlockCertificates.js`): major unlocked when `>= 80%` major progress; minor unlocked when `>= 80%` AND **all-or-none** — every minor course must individually be `>= 80%` (no course below threshold).
- Locked state shows progress %, a modal listing the criteria, and disables the view button until met.

### Global Minor Certificate Template (Supabase Storage)
- Replaced per-course certificate templates with a **single global template** stored in Supabase Storage (`certificates/minor-certificate-template.jpg`).
- `Certifications.jsx` fetches the template once via `getPublicUrl(...).data.publicUrl` and passes `template.template_url` to the modal; used for **all** minor courses.

### Qwen AI + High-Resolution Canvas Certificate Generator (NEW)
- **`src/services/qwenService.js`** — `getFormattedCertificateData({studentName, courseTitle, completionDate, duration, certificateId})`:
  - Calls DashScope OpenAI-compatible endpoint `https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions`, model `qwen-plus`, header `Authorization: Bearer ${VITE_QWEN_API_KEY}`.
  - System prompt acts as "Official Registrar AI for IH Academy"; returns JSON `{ formattedName, formattedCourse, formattedDuration, formattedDate, certificateId, verificationHash }` (preserves provided `certificateId`, else generates `IH-CERT-YYYY-NNNN`; formats date as DD/MM/YYYY).
  - **Graceful fallback** (title-cased name + normalized copy + generated id/hash) when key missing or request fails, so the cert always renders.
- **`src/components/CertificateCanvas.jsx`** — HTML5 `<canvas>` at **1920×1080 (A4)**:
  - Loads `template_url` image (`crossOrigin = 'anonymous'`) via `ctx.drawImage(img, 0, 0, 1920, 1080)`.
  - **Placeholder patching (CRITICAL):** before any text, wipes ONLY the baked-in placeholder strings (not the static label headers) with opaque white rectangles — `fillRect(480,470,960,90)` (recipient), `fillRect(520,625,880,55)` (course), `fillRect(580,782,170,32)` (duration, right half), `fillRect(980,782,160,32)` (date, right half), `fillRect(1380,782,260,32)` (cert id, right half).
  - Clean text overlay: Recipient Name `700 50px` `#2563EB` centered @ (960,532); Course Title `700 30px` `#0F172A` centered @ (960,665); Duration/Date/CertID `700 18px` `#0F172A` left-aligned @ (585,804)/(985,804)/(1385,804) — drawn over the erased inline placeholders so the "COURSE DURATION"/"COMPLETION DATE"/"CERTIFICATE ID" labels stay intact.
  - Waits on `document.fonts.ready` before drawing.
- **`src/components/MinorCourseCertificate.jsx`** — modal rewritten:
  - On open, calls `getFormattedCertificateData` and feeds AI-formatted name/course/duration/date/certId into the canvas.
  - The canvas **patches out** the template's placeholder text (white rects) so dynamic text never overlaps the baked-in strings.
  - "**Download HD Certificate Image**" button exports `canvas.toDataURL('image/png')` via an anchor download.
  - "Download PDF" uses `jsPDF.addImage(canvas.toDataURL('image/png'), ...)` (landscape A4).
  - Old CSS-overlay + `html2canvas` approach removed; added `certificateModal.css`.

## 3. Current Feature State
- Minor certificates render from a **global Supabase template** onto a **1920×1080 canvas**, with **AI-polished recipient/course copy** and a **verification hash/badge**.
- Modal offers **HD PNG** and **PDF** downloads plus a verify URL footer.
- Minor cert unlock remains **strict (>=80% all courses)**; majors unlock at >=80%.

## 4. What To Preserve
- Strict minor unlock (all-or-none >=80%); do not relax to "overall average".
- Single global template via `template_url` (no regression to per-course templates).
- Qwen fallback path so rendering never breaks without an API key.
- Counting manually-completed hidden/intro lessons as complete.
- Backend RPC + Supabase schema unchanged.

## 5. Open Items / Next Steps
- Add `VITE_QWEN_API_KEY` to `.env` (currently uses fallback metadata — AI copy not active until set).
- Confirm Supabase Storage CORS allows `crossOrigin='anonymous'` so `toDataURL` doesn't taint the canvas (falls back to `window.print()` if tainted).
- Optional: deep-link `verifyUrl` to a real verification route using `verificationHash`.
- Build warns about large chunks (`index`, `jspdf`, `html2canvas`) — consider further code-splitting if desired.
