import { createClient } from '@/lib/supabase/server';
import { BusinessModel } from '@/types/BusinessModel';
import { ProductWithRelations } from '@/lib/types/database';

export interface SavedModel {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: ProductWithRelations;
  businessModel?: BusinessModel;
}

// Helper function to convert Product to BusinessModel format
function mapProductToBusinessModel(product: ProductWithRelations): BusinessModel {
  return {
    id: product.id.toString(),
    title: product.name,
    description: product.description,
    category: product.category?.name || 'Unknown',
    tags: product.tags?.map(tag => tag.name) || [],
    upvotes: product.vote_count || 0,
    comments: product.comment_count || 0,
    author: {
      name: product.profile?.display_name || product.profile?.username || 'Anonymous',
      avatar: product.profile?.avatar_url || '/placeholder-avatar.png',
      verified: false
    },
    createdAt: product.created_at,
    featured: product.is_featured,
    revenue: 'Unknown',
    difficulty: 'Medium' as const,
    timeToMarket: 'Unknown',
    initialInvestment: 'Unknown',
    targetMarket: 'Unknown',
    image: product.thumbnail_url || '/placeholder-product.png',
    website: product.product_url || undefined,
    userCount: product.view_count
  };
}

export async function getSavedModels(userId: string): Promise<SavedModel[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('saved_models')
    .select(`
      *,
      product:products_with_stats!saved_models_product_id_fkey (
        *,
        profile:profiles!products_user_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          bio
        ),
        category:categories (
          id,
          name,
          slug
        ),
        tags:product_tags (
          tag:tags (
            id,
            name,
            slug
          )
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching saved models:', error);
    return [];
  }

  // Transform the data to include both product and businessModel formats
  const transformedData = (data || []).map((item: any) => {
    if (item.product) {
      // Extract tags properly
      const productWithTags = {
        ...item.product,
        tags: item.product.tags?.map((pt: any) => pt.tag).filter(Boolean) || []
      };
      
      return {
        ...item,
        product: productWithTags,
        businessModel: mapProductToBusinessModel(productWithTags as ProductWithRelations)
      };
    }
    return item;
  });

  return transformedData;
}

export async function saveModel(userId: string, productId: string): Promise<boolean> {
  const supabase = await createClient();
  
  // Convert string ID to number if needed
  const numericProductId = isNaN(Number(productId)) ? productId : Number(productId);
  
  const { error } = await supabase
    .from('saved_models')
    .insert({
      user_id: userId,
      product_id: numericProductId
    });

  if (error) {
    console.error('Error saving model:', error);
    return false;
  }

  return true;
}

export async function unsaveModel(userId: string, productId: string): Promise<boolean> {
  const supabase = await createClient();
  
  // Convert string ID to number if needed
  const numericProductId = isNaN(Number(productId)) ? productId : Number(productId);
  
  const { error } = await supabase
    .from('saved_models')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', numericProductId);

  if (error) {
    console.error('Error unsaving model:', error);
    return false;
  }

  return true;
}

export async function isModelSaved(userId: string, productId: string): Promise<boolean> {
  const supabase = await createClient();
  
  // Convert string ID to number if needed
  const numericProductId = isNaN(Number(productId)) ? productId : Number(productId);
  
  const { data, error } = await supabase
    .from('saved_models')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', numericProductId)
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

export async function toggleSaveModel(userId: string, productId: string): Promise<boolean> {
  const isSaved = await isModelSaved(userId, productId);
  
  if (isSaved) {
    return await unsaveModel(userId, productId);
  } else {
    return await saveModel(userId, productId);
  }
}
