import { createClient } from '@/lib/supabase/server';

export interface SavedModel {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: {
    id: string;
    title: string;
    description: string;
    category: string;
    thumbnail_url?: string;
    author: {
      username: string;
      avatar_url?: string;
    };
  };
}

export async function getSavedModels(userId: string): Promise<SavedModel[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('saved_models')
    .select(`
      *,
      product:products (
        id,
        title,
        description,
        category,
        thumbnail_url,
        author:profiles!products_author_id_fkey (
          username,
          avatar_url
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching saved models:', error);
    return [];
  }

  return data || [];
}

export async function saveModel(userId: string, productId: string): Promise<boolean> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('saved_models')
    .insert({
      user_id: userId,
      product_id: productId
    });

  if (error) {
    console.error('Error saving model:', error);
    return false;
  }

  return true;
}

export async function unsaveModel(userId: string, productId: string): Promise<boolean> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('saved_models')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);

  if (error) {
    console.error('Error unsaving model:', error);
    return false;
  }

  return true;
}

export async function isModelSaved(userId: string, productId: string): Promise<boolean> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('saved_models')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return false;
    }
    console.error('Error checking saved model:', error);
    return false;
  }

  return !!data;
}
