import { supabase } from '@/lib/supabase-client';
import { Category, Tag } from '@/lib/types/database';

export async function fetchCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    return { data: [], error };
  }

  return { data: data as unknown as Category[], error: null };
}

export async function fetchTags() {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching tags:', error);
    return { data: [], error };
  }

  return { data: data as unknown as Tag[], error: null };
}

export async function fetchCategoryBySlug(slug: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug as any)
    .single();

  if (error) {
    console.error('Error fetching category:', error);
    return { data: null, error };
  }

  return { data: data as unknown as Category, error: null };
}

export async function fetchTagBySlug(slug: string) {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('slug', slug as any)
    .single();

  if (error) {
    console.error('Error fetching tag:', error);
    return { data: null, error };
  }

  return { data: data as unknown as Tag, error: null };
}