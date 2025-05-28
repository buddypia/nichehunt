import { createClient } from '@/lib/supabase-client';
import { Collection, ProductWithRelations } from '@/lib/types/database';
import { BusinessModel } from '@/types/BusinessModel';

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

// デフォルトコレクションの名前
const DEFAULT_COLLECTION_NAME = 'Default Collection';
const DEFAULT_COLLECTION_DESCRIPTION = 'お気に入りのビジネスモデルのコレクション';

// ユーザーのデフォルトコレクションを取得または作成
export async function getOrCreateDefaultCollection(userId: string): Promise<Collection | null> {
  const supabase = createClient();

  // まず既存のデフォルトコレクションを探す
  const { data: existingCollection, error: fetchError } = await supabase
    .from('collections')
    .select('*')
    .eq('user_id', userId)
    .eq('name', DEFAULT_COLLECTION_NAME)
    .maybeSingle();

  if (existingCollection) {
    return existingCollection;
  }

  // 存在しない場合は作成
  const { data: newCollection, error: createError } = await supabase
    .from('collections')
    .insert({
      user_id: userId,
      name: DEFAULT_COLLECTION_NAME,
      description: DEFAULT_COLLECTION_DESCRIPTION,
      is_public: true
    })
    .select()
    .single();

  if (createError) {
    console.error('Error creating default collection:', createError);
    return null;
  }

  return newCollection;
}

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

// ユーザーの保存したビジネスモデルを取得（デフォルトコレクションから）
export async function getSavedModels(userId: string): Promise<{ products: ProductWithRelations[], businessModels: BusinessModel[] }> {
  const collection = await getOrCreateDefaultCollection(userId);
  
  if (!collection) {
    return { products: [], businessModels: [] };
  }

  const products = await getCollectionProducts(collection.id);
  const businessModels = products.map(product => mapProductToBusinessModel(product));

  return { products, businessModels };
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

// コレクションの詳細を取得（プロダクト数を含む）
export async function getCollectionWithCount(collectionId: number): Promise<Collection & { product_count: number } | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('collections')
    .select(`
      *,
      collection_products (count)
    `)
    .eq('id', collectionId)
    .single();

  if (error) {
    console.error('Error fetching collection with count:', error);
    return null;
  }

  return {
    ...data,
    product_count: data.collection_products?.[0]?.count || 0
  };
}

// デフォルトコレクションに対するヘルパー関数
export async function saveModel(userId: string, productId: string): Promise<boolean> {
  const collection = await getOrCreateDefaultCollection(userId);
  if (!collection) return false;

  const numericProductId = Number(productId);
  return await addProductToCollection(collection.id, numericProductId);
}

export async function unsaveModel(userId: string, productId: string): Promise<boolean> {
  const collection = await getOrCreateDefaultCollection(userId);
  if (!collection) return false;

  const numericProductId = Number(productId);
  return await removeProductFromCollection(collection.id, numericProductId);
}

export async function isModelSaved(userId: string, productId: string): Promise<boolean> {
  const collection = await getOrCreateDefaultCollection(userId);
  if (!collection) return false;

  const numericProductId = Number(productId);
  return await isProductInCollection(collection.id, numericProductId);
}

export async function toggleSaveModel(userId: string, productId: string): Promise<boolean> {
  const isSaved = await isModelSaved(userId, productId);
  
  if (isSaved) {
    return await unsaveModel(userId, productId);
  } else {
    return await saveModel(userId, productId);
  }
}
