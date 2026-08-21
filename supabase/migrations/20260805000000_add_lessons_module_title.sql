-- Add a human-readable module title to every lessons row so the Course
-- Overview syllabus and Learn sidebar can render "Module 1 — The Node.js
-- Runtime" style headers instead of deriving "Module N" from module_order.
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS module_title TEXT;
