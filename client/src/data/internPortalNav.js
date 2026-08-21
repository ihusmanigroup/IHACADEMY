import { LayoutDashboard, FileText, BookOpen, UploadCloud, BarChart3, Award, FileCheck } from 'lucide-react'

export const sidebarItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'assignments', label: 'Assignments', icon: FileText },
  { id: 'courses', label: 'Free Courses', icon: BookOpen },
  { id: 'submissions', label: 'Submissions', icon: UploadCloud },
  { id: 'progress', label: 'Progress', icon: BarChart3 },
  { id: 'certificate', label: 'Certificate', icon: Award },
  { id: 'lor', label: 'LOR', icon: FileCheck },
]
