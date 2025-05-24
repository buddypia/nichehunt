import { createClient } from '@/lib/supabase/server'
import { Topic } from '@/lib/topics-client'

export type { Topic }

export async function getTopics(): Promise<Topic[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .order('name', { ascending: true })
  
  if (error) {
    console.error('Error fetching topics:', error)
    return []
  }
  
  return data || []
}

export async function getTopicBySlug(slug: string): Promise<Topic | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error) {
    console.error('Error fetching topic by slug:', error)
    return null
  }
  
  return data
}
