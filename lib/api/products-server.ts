import { createClient } from '@/lib/supabase/server'
import type { ProductWithRelations, ProductWithStats } from '@/lib/types/database'

// デフォルトコレクション名の定数
const DEFAULT_COLLECTION_NAME = 'Default Collection'

// 効率的にプロダクトデータを取得してProductCard形式に整形
export async function getProductsWithRelations({
  categorySlug,
  sort = 'popular',
  page = 1,
  limit = 20,
  search,
  tagSlug,
}: {
  categorySlug?: string
  sort?: 'popular' | 'newest' | 'comments' | 'featured'
  page?: number
  limit?: number
  search?: string
  tagSlug?: string
} = {}) {
  const supabase = await createClient()
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
      
      if (productIds && productIds.length > 0) {
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

  if (error || !products) {
    console.error('Error fetching products:', error)
    return { products: [], count: 0, error }
  }

  // 効率的にプロダクトデータを整形
  const enrichedProducts = await enrichProductsEfficiently(products as unknown as ProductWithStats[])

  return {
    products: enrichedProducts,
    count: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  }
}

// 効率的な一括データ取得
async function enrichProductsEfficiently(products: ProductWithStats[]): Promise<ProductWithRelations[]> {
  const supabase = await createClient()
  
  // 現在のユーザーを取得
  const { data: { user } } = await supabase.auth.getUser()

  // ユニークなIDを収集
  const userIds = Array.from(new Set(products.map(p => p.user_id)))
  const categoryIds = Array.from(new Set(products.filter(p => p.category_id).map(p => p.category_id!)))
  const productIds = products.map(p => p.id)

  // ユーザーのデフォルトコレクションIDを取得
  let defaultCollectionId: number | null = null
  if (user) {
    const { data: collection } = await supabase
      .from('collections')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', DEFAULT_COLLECTION_NAME)
      .single()
    
    defaultCollectionId = collection?.id || null
  }

  // 並列で一括データ取得
  const [profiles, categories, productTags, tags, votes, savedProducts] = await Promise.all([
    // プロファイルを一括取得
    supabase
      .from('profiles')
      .select('*')
      .in('id', userIds),
    
    // カテゴリを一括取得
    categoryIds.length > 0 
      ? supabase
          .from('categories')
          .select('*')
          .in('id', categoryIds)
      : Promise.resolve({ data: [] }),
    
    // プロダクトタグを一括取得
    supabase
      .from('product_tags')
      .select('product_id, tag_id')
      .in('product_id', productIds),
    
    // タグを一括取得（プロダクトタグから必要なものだけ）
    supabase
      .from('tags')
      .select('*'),
    
    // ユーザーの投票状態を一括取得
    user 
      ? supabase
          .from('votes')
          .select('product_id')
          .eq('user_id', user.id)
          .in('product_id', productIds)
      : Promise.resolve({ data: [] }),
    
    // ユーザーの保存状態を一括取得
    user && defaultCollectionId
      ? supabase
          .from('collection_products')
          .select('product_id')
          .eq('collection_id', defaultCollectionId)
          .in('product_id', productIds)
      : Promise.resolve({ data: [] }),
  ])

  // データをマップに変換して高速アクセス
  const profileMap = new Map((profiles.data || []).map(p => [p.id, p]))
  const categoryMap = new Map((categories.data || []).map(c => [c.id, c]))
  const tagMap = new Map((tags.data || []).map(t => [t.id, t]))
  const votedProductIds = new Set((votes.data || []).map(v => v.product_id))
  const savedProductIds = new Set((savedProducts.data || []).map(sp => sp.product_id))
  
  // プロダクトIDごとのタグIDをマップ化
  const productTagsMap = new Map<number, number[]>()
  ;(productTags.data || []).forEach(pt => {
    if (!productTagsMap.has(pt.product_id)) {
      productTagsMap.set(pt.product_id, [])
    }
    productTagsMap.get(pt.product_id)!.push(pt.tag_id)
  })

  // プロダクトデータを整形
  return products.map(product => {
    const tagIds = productTagsMap.get(product.id) || []
    const productTags = tagIds
      .map(tagId => tagMap.get(tagId))
      .filter(tag => tag !== undefined)

    return {
      ...product,
      profile: profileMap.get(product.user_id) || null,
      category: product.category_id ? categoryMap.get(product.category_id) || null : null,
      tags: productTags,
      has_voted: votedProductIds.has(product.id),
      is_saved: savedProductIds.has(product.id),
      images: [], // HomeClientでは使用されないため空配列
    } as ProductWithRelations
  })
}



// トレンドプロダクトを効率的に取得
export async function getTrendingProductsEfficiently(period: 'today' | 'week' | 'month' = 'today') {
  const supabase = await createClient()
  
  // 期間でフィルタリング用の日付を計算
  const now = new Date()
  let dateFilter: string
  
  switch (period) {
    case 'today':
      const today = new Date(now)
      today.setHours(0, 0, 0, 0)
      dateFilter = today.toISOString()
      break
    case 'week':
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      dateFilter = weekAgo.toISOString()
      break
    case 'month':
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      dateFilter = monthAgo.toISOString()
      break
  }

  const { data: products } = await supabase
    .from('products_with_stats')
    .select('*')
    .eq('status', 'published' as any)
    .gte('launch_date', dateFilter as any)
    .order('vote_count', { ascending: false })
    .limit(20)

  if (!products) return []

  return enrichProductsEfficiently(products as unknown as ProductWithStats[])
}
