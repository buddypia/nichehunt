import { createClient } from '@/lib/supabase/server'
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
  const supabase = await createClient()
  const offset = (page - 1) * limit

  let query = supabase
    .from('products_with_stats')
    .select('*')
    .eq('status', 'published')

  // カテゴリでフィルタ
  if (categorySlug) {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single()
    
    if (category) {
      query = query.eq('category_id', category.id)
    }
  }

  // タグでフィルタ
  if (tagSlug) {
    const { data: tag } = await supabase
      .from('tags')
      .select('id')
      .eq('slug', tagSlug)
      .single()
    
    if (tag) {
      const { data: productIds } = await supabase
        .from('product_tags')
        .select('product_id')
        .eq('tag_id', tag.id)
      
      if (productIds && productIds.length > 0) {
        query = query.in('id', productIds.map(p => p.product_id))
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
      query = query.eq('is_featured', true).order('launch_date', { ascending: false })
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
  const enrichedProducts = await enrichProducts(products || [])

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
  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from('products_with_stats')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !product) {
    console.error('Error fetching product:', error)
    return null
  }

  // 関連情報を取得
  const [profile, category, tags, images] = await Promise.all([
    getProfile(product.user_id),
    getCategory(product.category_id),
    getProductTags(product.id),
    getProductImages(product.id),
  ])

  const user = await supabase.auth.getUser()
  const hasVoted = user.data.user ? await checkUserVote(product.id, user.data.user.id) : false

  return {
    ...product,
    profile,
    category,
    tags,
    images,
    has_voted: hasVoted,
  } as ProductWithRelations
}

// ユーザーのプロダクトを取得
export async function getUserProducts(userId: string) {
  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from('products_with_stats')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user products:', error)
    return []
  }

  return enrichProducts(products || [])
}

// プロダクトを投票
export async function voteProduct(productId: number) {
  const supabase = await createClient()
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
  const supabase = await createClient()
  const user = await supabase.auth.getUser()

  return Promise.all(products.map(async (product) => {
    const [profile, category, tags] = await Promise.all([
      getProfile(product.user_id),
      getCategory(product.category_id),
      getProductTags(product.id),
    ])

    const hasVoted = user.data.user ? await checkUserVote(product.id, user.data.user.id) : false

    return {
      ...product,
      profile,
      category,
      tags,
      has_voted: hasVoted,
    } as ProductWithRelations
  }))
}

async function getProfile(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data
}

async function getCategory(categoryId: number | null) {
  if (!categoryId) return null
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('id', categoryId)
    .single()
  return data
}

async function getProductTags(productId: number) {
  const supabase = await createClient()
  const { data: productTags } = await supabase
    .from('product_tags')
    .select('tag_id')
    .eq('product_id', productId)

  if (!productTags || productTags.length === 0) return []

  const { data: tags } = await supabase
    .from('tags')
    .select('*')
    .in('id', productTags.map(pt => pt.tag_id))

  return tags || []
}

async function getProductImages(productId: number) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', productId)
    .order('display_order')
  return data || []
}

async function checkUserVote(productId: number, userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('votes')
    .select('user_id')
    .eq('product_id', productId)
    .eq('user_id', userId)
    .single()
  return !!data
}

// 今日のピックアップを取得
export async function getTodaysPicks() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: products } = await supabase
    .from('products_with_stats')
    .select('*')
    .eq('status', 'published')
    .eq('launch_date', today)
    .order('vote_count', { ascending: false })
    .limit(5)

  return enrichProducts(products || [])
}

// 注目のプロダクトを取得
export async function getFeaturedProducts() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products_with_stats')
    .select('*')
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('launch_date', { ascending: false })
    .limit(10)

  return enrichProducts(products || [])
}

// トレンディングプロダクトを取得
export async function getTrendingProducts() {
  const supabase = await createClient()
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: products } = await supabase
    .from('products_with_stats')
    .select('*')
    .eq('status', 'published')
    .gte('launch_date', sevenDaysAgo.toISOString())
    .order('vote_count', { ascending: false })
    .limit(20)

  return enrichProducts(products || [])
}
