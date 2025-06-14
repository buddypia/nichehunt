import { createClient } from '@/lib/supabase/client';
import { Collection, ProductWithRelations } from '@/lib/types/database';

// コレクション内のプロダクトを取得
export async function getCollectionProducts(collectionId: number): Promise<ProductWithRelations[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('collection_products')
    .select(`
      product_id,
      added_at,
      product:products_with_stats!collection_products_product_id_fkey (
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
    .eq('collection_id', collectionId)
    .order('added_at', { ascending: false });

  if (error) {
    console.error('Error fetching collection products:', error);
    return [];
  }

  // Transform the data to extract products with tags
  const products = (data || []).map((item: any) => {
    if (item.product) {
      return {
        ...item.product,
        tags: item.product.tags?.map((pt: any) => pt.tag).filter(Boolean) || []
      };
    }
    return null;
  }).filter(Boolean);

  return products;
}

// プロダクトをコレクションに追加
export async function addProductToCollection(collectionId: number, productId: number): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from('collection_products')
    .insert({
      collection_id: collectionId,
      product_id: productId
    });

  if (error) {
    console.error('Error adding product to collection:', error);
    return false;
  }

  return true;
}

// プロダクトをコレクションから削除
export async function removeProductFromCollection(collectionId: number, productId: number): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from('collection_products')
    .delete()
    .eq('collection_id', collectionId)
    .eq('product_id', productId);

  if (error) {
    console.error('Error removing product from collection:', error);
    return false;
  }

  return true;
}

// プロダクトがコレクションに含まれているかチェック
export async function isProductInCollection(collectionId: number, productId: number): Promise<boolean> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('collection_products')
    .select('collection_id')
    .eq('collection_id', collectionId)
    .eq('product_id', productId)
    .maybeSingle();

  if (error) {
    console.error('Error checking product in collection:', error);
    return false;
  }

  return !!data;
}

// ユーザーの全コレクションを取得
export async function getUserCollections(userId: string): Promise<Collection[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user collections:', error);
    return [];
  }

  return data || [];
}

// コレクションを作成
export async function createCollection(
  userId: string,
  name: string,
  description: string = '',
  isPublic: boolean = true
): Promise<Collection | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('collections')
    .insert({
      user_id: userId,
      name,
      description,
      is_public: isPublic
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating collection:', error);
    return null;
  }

  return data;
}

// コレクションを更新
export async function updateCollection(
  collectionId: number,
  updates: {
    name?: string;
    description?: string;
    is_public?: boolean;
  }
): Promise<Collection | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('collections')
    .update(updates)
    .eq('id', collectionId)
    .select()
    .single();

  if (error) {
    console.error('Error updating collection:', error);
    return null;
  }

  return data;
}

// コレクションを削除
export async function deleteCollection(collectionId: number): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('id', collectionId);

  if (error) {
    console.error('Error deleting collection:', error);
    return false;
  }

  return true;
}