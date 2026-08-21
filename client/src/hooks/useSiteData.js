import { useTableData, useSiteSettings } from './useTableData'

export function useSiteData() {
  const { settings, loading, error } = useSiteSettings()
  return { settings, loading, error }
}

export function useAnnouncements() {
  const { data, loading, error } = useTableData('announcements', {
    orderBy: 'sort_order',
    fallback: [],
  })
  const active = (data || []).filter((a) => a.is_active)
  return { announcements: active, loading, error }
}

export function useTestimonials() {
  const { data, loading, error } = useTableData('testimonials', {
    orderBy: 'sort_order',
    fallback: [],
  })
  const active = (data || []).filter((t) => t.is_active)
  return { testimonials: active, loading, error }
}

export function useFaqs() {
  const { data, loading, error } = useTableData('faqs', {
    orderBy: 'sort_order',
    fallback: [],
  })
  const active = (data || []).filter((f) => f.is_active)
  return { faqs: active, loading, error }
}

export function useFeatures() {
  const { data, loading, error } = useTableData('features', {
    orderBy: 'sort_order',
    fallback: [],
  })
  const active = (data || []).filter((f) => f.is_active)
  return { features: active, loading, error }
}

export function useAboutSections() {
  const { data, loading, error } = useTableData('about_sections', {
    orderBy: 'sort_order',
    fallback: [],
  })
  const active = (data || []).filter((s) => s.is_active)
  return { sections: active, loading, error }
}
