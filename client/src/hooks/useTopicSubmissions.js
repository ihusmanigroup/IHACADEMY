import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const MAX_PDF_BYTES = 10 * 1024 * 1024

function isPdfFile(file) {
  return file.type === 'application/pdf' || /\.pdf$/i.test(file.name)
}

// useTopicSubmissions — fetch/create/update a single topic submission.
// Mirrors the submission flow used by AssignmentSubmissionPanel but scoped
// to a (user, course, lesson, topic) tuple.
export function useTopicSubmissions({ courseId, lessonId, topicId, courseType }) {
  const { user } = useAuth()
  const [submission, setSubmission] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!user || !courseId || !lessonId || !topicId) {
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('topic_submissions')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .eq('lesson_id', lessonId)
      .eq('topic_id', topicId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) {
      console.warn('topic_submissions load failed:', error.message)
      setSubmission(null)
    } else {
      setSubmission(data)
    }
    setLoading(false)
  }, [user, courseId, lessonId, topicId])

  useEffect(() => {
    load()
  }, [load])

  const uploadPdf = useCallback(async (file) => {
    if (!file) return null
    if (!isPdfFile(file)) throw new Error('Only PDF files are allowed')
    if (file.size > MAX_PDF_BYTES) throw new Error('PDF must be under 10MB')
    const path = `${user.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const { error } = await supabase.storage
      .from('topic-submissions')
      .upload(path, file, { upsert: true })
    if (error) throw error
    const { data: urlData } = supabase.storage
      .from('topic-submissions')
      .getPublicUrl(path)
    return urlData?.publicUrl || null
  }, [user])

  const submit = useCallback(async ({ githubUrl, demoLink, codeSnippet, pdfFile, topicTitle }) => {
    if (!user) throw new Error('Not authenticated')
    setSubmitting(true)
    setError(null)
    try {
      let fileUrl = null
      if (pdfFile) fileUrl = await uploadPdf(pdfFile)

      const payload = {
        user_id: user.id,
        course_id: courseId,
        lesson_id: lessonId,
        topic_id: topicId,
        topic_title: topicTitle || submission?.topic_title || '',
        course_type: courseType || 'free',
        github_url: githubUrl || null,
        demo_link: demoLink || null,
        code_snippet: codeSnippet || null,
        file_url: fileUrl || submission?.file_url || null,
        status: 'pending',
      }

      // Upsert by unique tuple so resubmissions replace the pending row.
      const { data, error } = await supabase
        .from('topic_submissions')
        .upsert(payload, {
          onConflict: 'user_id,course_id,lesson_id,topic_id',
        })
        .select()
        .maybeSingle()
      if (error) throw error
      setSubmission(data)
      return data
    } catch (err) {
      setError(err.message || 'Submission failed')
      throw err
    } finally {
      setSubmitting(false)
    }
  }, [user, courseId, lessonId, topicId, courseType, submission, uploadPdf])

  return { submission, loading, submitting, error, submit, reload: load }
}
