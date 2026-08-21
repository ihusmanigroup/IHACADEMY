import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Generic CMS fetch hook backed by the Supabase `profiles`-style public tables.
 * Queries a table, orders by an optional column, and exposes loading + error
 * + a fallback value that is used while loading or if the fetch fails (so UI
 * never flashes empty — it renders the previous static data as a fallback).
 */
export function useTableData(table, { orderBy, fallback = [], fallbackEnabled = true } = {}) {
  const [data, setData] = useState(fallbackEnabled ? fallback : [])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      let query = supabase.from(table).select('*')
      if (orderBy) query = query.order(orderBy, { ascending: true })
      const { data: rows, error: err } = await query

      if (cancelled) return
      if (err) {
        setError(err)
        setLoading(false)
        // Keep the static fallback rendered instead of a blank screen.
        return
      }
      setData(rows || [])
      setError(null)
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [table, orderBy])

  return { data, loading, error, setData }
}

/** Convenience: fetch site_settings as a { key: value } object. */
export function useSiteSettings() {
  const { data, loading, error } = useTableData('site_settings', { fallback: [] })
  const settings = {}
  for (const row of data) settings[row.key] = row.value
  return { settings, loading, error }
}

/** Convenience: fetch a single row by key/column (e.g. a featured course). */
export function useTableRow(table, column, value, fallback = null) {
  const [row, setRow] = useState(fallback)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      const { data, error: err } = await supabase
        .from(table)
        .select('*')
        .eq(column, value)
        .maybeSingle()
      if (cancelled) return
      if (err) setError(err)
      else setRow(data || fallback)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [table, column, value, fallback])

  return { row, loading, error }
}
