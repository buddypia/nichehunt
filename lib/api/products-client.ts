import { createClient } from '@/lib/supabase/client';
import type { ProductWithRelations, ProductWithStats } from '@/lib/types/database'

// ソートタイプの定義
export type SortType = 'popular' | 'newest' | 'comments' | 'featured'

// プロダクト一覧を取得
export async function getProducts({
  categorySlug,
  sort = 'popular',
  page = 1,
  limit = 20,
  search,
  tagSlug,
}: {
  categorySlug?: string
  sort?: SortType
  page?: number
  limit?: number
  search?: string
  tagSlug?: string
} = {}) {
  const supabase = createClient()
  const offset = (page - 1) * limit

  let query = supabase
    .from('products_with_stats')
    .select('*')
    .eq('status', 'published' as any)

  // カテゴリでフィルタ
  if (categorySlug) {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug as any)
      .single()
    
    if (category && 'id' in category) {
      query = query.eq('category_id', category.id as any)
    }
  }

  // タグでフィルタ
  if (tagSlug) {
    const { data: tag } = await supabase
      .from('tags')
      .select('id')
      .eq('slug', tagSlug as any)
      .single()
    
    if (tag && 'id' in tag) {
      const { data: productIds } = await supabase
        .from('product_tags')
        .select('product_id')
        .eq('tag_id', tag.id as any)
      
      if (productIds && productIds.length > 0 && Array.isArray(productIds)) {
        query = query.in('id', productIds.map(p => (p as any).product_id))
      }
    }
  }

  // 検索
  if (search) {
    query = query.or(`name.ilike.%${search}%,tagline.ilike.%${search}%,description.ilike.%${search}%`)
  }

  // ソート
  switch (sort) {
    case 'popular':
      query = query.order('vote_count', { ascending: false })
      break
    case 'newest':
      query = query.order('launch_date', { ascending: false })
      break
    case 'comments':
      query = query.order('comment_count', { ascending: false })
      break
    case 'featured':
      query = query.eq('is_featured', true as any).order('launch_date', { ascending: false })
      break
  }

  // ページネーション
  query = query.range(offset, offset + limit - 1)

  const { data: products, error, count } = await query

  if (error) {
    console.error('Error fetching products:', error)
    return { products: [], count: 0, error }
  }

  // プロファイル、カテゴリ、タグ情報を追加
  const enrichedProducts = await enrichProducts((products || []) as unknown as ProductWithStats[])

  return {
    products: enrichedProducts,
    count: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  }
}

// プロダクト詳細を取得
export async function getProduct(id: string) {
  const supabase = createClient()

  const { data: product, error } = await supabase
    .from('products_with_stats')
    .select('*')
    .eq('id', id as any)
    .single()

  if (error || !product || !('id' in product)) {
    console.error('Error fetching product:', error)
    return null
  }

  // 関連情報を取得
  const [profile, category, tags, images] = await Promise.all([
    getProfile((product as any).user_id),
    getCategory((product as any).category_id),
    getProductTags((product as any).id),
    getProductImages((product as any).id),
  ])

  const user = await supabase.auth.getUser()
  const hasVoted = user.data.user ? await checkUserVote((product as any).id, user.data.user.id) : false

  return {
    ...(product as any),
    profile,
    category,
    tags,
    images,
    has_voted: hasVoted,
  } as ProductWithRelations
}

// ユーザーのプロダクトを取得
export async function getUserProducts(userId: string) {
  const supabase = createClient()

  const { data: products, error } = await supabase
    .from('products_with_stats')
    .select('*')
    .eq('user_id', userId as any)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user products:', error)
    return []
  }

  return enrichProducts((products || []) as unknown as ProductWithStats[])
}

// プロダクトを更新するためのインターフェース
export interface UpdateProductData {
  name?: string;
  tagline?: string;
  description?: string;
  product_url?: string | null;
  github_url?: string | null;
  demo_url?: string | null;
  thumbnail_url?: string | null;
  category_id?: number | null;
  // status?: string; // ステータス変更は別のフローを推奨
  // launch_date?: string; // ローンチ日変更も注意が必要
  // tags?: { id: number; name: string }[]; // タグの更新は別途処理が必要
}

// プロダクトを更新
export async function updateProduct(productId: number, data: UpdateProductData) {
  const supabase = createClient();
  const user = await supabase.auth.getUser();

  if (!user.data.user) {
    return { data: null, error: { message: 'Not authenticated' } };
  }

  // Ensure only the owner can update (though RLS should enforce this)
  // For client-side, this check is more for immediate feedback or specific logic
  const { data: productOwner, error: ownerError } = await supabase
    .from('products')
    .select('user_id')
    .eq('id', productId)
    .single();

  if (ownerError || !productOwner) {
    return { data: null, error: { message: ownerError?.message || 'Product not found' } };
  }

  if (productOwner.user_id !== user.data.user.id) {
    return { data: null, error: { message: 'You do not have permission to update this product.' } };
  }
  
  // 'updated_at' フィールドを自動的に設定
  const updatePayload = {
    ...data,
    updated_at: new Date().toISOString(),
  };

  const { data: updatedProduct, error } = await supabase
    .from('products')
    .update(updatePayload)
    .eq('id', productId)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    return { data: null, error };
  }

  return { data: updatedProduct, error: null };
}

// プロダクトを削除
export async function deleteProduct(productId: number) {
  const supabase = createClient();
  const user = await supabase.auth.getUser();

  if (!user.data.user) {
    return { error: { message: 'Not authenticated' } };
  }

  // サーバーサイドのRLSが主たるガードだが、クライアントからの呼び出し前に確認
  const { data: productOwner, error: ownerError } = await supabase
    .from('products')
    .select('user_id')
    .eq('id', productId)
    .single();

  if (ownerError || !productOwner) {
    return { error: { message: ownerError?.message || 'Product not found or error checking ownership.' } };
  }

  if (productOwner.user_id !== user.data.user.id) {
    return { error: { message: 'You do not have permission to delete this product.' } };
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) {
    console.error('Error deleting product:', error);
    return { error };
  }

  return { error: null };
}

// プロダクトを投票
export async function voteProduct(productId: number) {
  const supabase = createClient()
  const user = await supabase.auth.getUser()

  if (!user.data.user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .rpc('toggle_vote', { p_product_id: productId })

  return { data, error }
}

// ヘルパー関数
async function enrichProducts(products: ProductWithStats[]): Promise<ProductWithRelations[]> {
  const supabase = createClient()
  const user = await supabase.auth.getUser()

  // ユーザーの投票状態を一括取得
  let votedProductIds = new Set<number>()
  if (user.data.user) {
    const productIds = products.map(p => p.id)
    votedProductIds = await checkUserVotesBatch(productIds, user.data.user.id)
  }

  // 各プロダクトの関連情報を並列で取得
  return Promise.all(products.map(async (product) => {
    const [profile, category, tags] = await Promise.all([
      getProfile(product.user_id),
      getCategory(product.category_id),
      getProductTags(product.id),
    ])

    return {
      ...product,
      profile,
      category,
      tags,
      has_voted: votedProductIds.has(product.id),
    } as unknown as ProductWithRelations
  }))
}

async function getProfile(userId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId as any)
    .single()
  return data
}

async function getCategory(categoryId: number | null) {
  if (!categoryId) return null
  const supabase = createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('id', categoryId as any)
    .single()
  return data
}

async function getProductTags(productId: number) {
  const supabase = createClient()
  const { data: productTags } = await supabase
    .from('product_tags')
    .select('tag_id')
    .eq('product_id', productId as any)

  if (!productTags || productTags.length === 0) return []

  const { data: tags } = await supabase
    .from('tags')
    .select('*')
    .in('id', productTags.map(pt => (pt as any).tag_id))

  return tags || []
}

async function getProductImages(productId: number) {
  const supabase = createClient()
  const { data } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', productId as any)
    .order('display_order')
  return data || []
}

async function checkUserVote(productId: number, userId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('votes')
    .select('user_id')
    .eq('product_id', productId as any)
    .eq('user_id', userId as any)
    .single()
  return !!data
}

// 複数のプロダクトに対する投票状態を一括取得
async function checkUserVotesBatch(productIds: number[], userId: string): Promise<Set<number>> {
  const supabase = createClient()
  const { data } = await supabase
    .from('votes')
    .select('product_id')
    .eq('user_id', userId as any)
    .in('product_id', productIds)

  const votedProductIds = new Set<number>()
  if (data && Array.isArray(data)) {
    data.forEach(vote => {
      if ('product_id' in vote) {
        votedProductIds.add(vote.product_id as number)
      }
    })
  }

  return votedProductIds
}

// 今日のピックアップを取得
export async function getTodaysPicks() {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: products } = await supabase
    .from('products_with_stats')
    .select('*')
    .eq('status', 'published' as any)
    .eq('launch_date', today as any)
    .order('vote_count', { ascending: false })
    .limit(5)

  return enrichProducts((products || []) as unknown as ProductWithStats[])
}

// 注目のプロダクトを取得
export async function getFeaturedProducts() {
  const supabase = createClient()

  const { data: products } = await supabase
    .from('products_with_stats')
    .select('*')
    .eq('status', 'published' as any)
    .eq('is_featured', true as any)
    .order('launch_date', { ascending: false })
    .limit(10)

  return enrichProducts((products || []) as unknown as ProductWithStats[])
}

// トレンディングプロダクトを取得
export async function getTrendingProducts() {
  const supabase = createClient()
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: products } = await supabase
    .from('products_with_stats')
    .select('*')
    .eq('status', 'published' as any)
    .gte('launch_date', sevenDaysAgo.toISOString())
    .order('vote_count', { ascending: false })
    .limit(20)

  return enrichProducts((products || []) as unknown as ProductWithStats[])
}
