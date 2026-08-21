import { supabase } from './supabase'

/**
 * Record a completed billing transaction for the current user.
 * item_type: 'plan' | 'course'
 * Returns the inserted row, or null when no user is signed in.
 */
export async function recordTransaction({ item_type, item_name, amount }) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      user_email: user.email || null,
      item_type,
      item_name,
      amount: amount || 0,
      status: 'completed',
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}