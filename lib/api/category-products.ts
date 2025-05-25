import { createClient } from '@/lib/supabase/server'
import { createStaticClient } from '@/lib/supabase/static'
import { BusinessModel } from '@/types/BusinessModel'

export async function getCategoryBySlug(slug: string) {
  try {
    // 通常のサーバークライアントを試す
    const supabase = await createClient()
    
    const { data: category, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single()
    
    if (error || !category) {
      return null
    }
    
    return category
  } catch (error) {
    // ビルド時のエラーをキャッチして静的クライアントを使用
    const supabase = createStaticClient()
  
    const { data: category, error: staticError } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single()
    
    if (staticError || !category) {
      return null
    }
    
    return category
  }
}

export async function getProductsByCategory(categoryId: number): Promise<BusinessModel[]> {
  let supabase;
  try {
    supabase = await createClient()
  } catch (error) {
    // ビルド時のエラーをキャッチして静的クライアントを使用
    supabase = createStaticClient()
  }
  
  // プロダクトと関連データを取得
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select(`
      *,
      profiles!products_user_id_fkey (
        username,
        display_name,
        avatar_url
      ),
      categories!products_category_id_fkey (
        name
      )
    `)
    .eq('category_id', categoryId)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
  
  if (productsError || !products) {
    console.error('Error fetching products:', productsError)
    return []
  }
  
  // 各プロダクトの投票数とコメント数を取得
  const productIds = products.map(p => p.id)
  
  const { data: voteCounts } = await supabase
    .from('votes')
    .select('product_id')
    .in('product_id', productIds)
  
  const { data: commentCounts } = await supabase
    .from('comments')
    .select('product_id')
    .in('product_id', productIds)
  
  // 投票数とコメント数を集計
  const votesByProduct = voteCounts?.reduce((acc, vote) => {
    acc[vote.product_id] = (acc[vote.product_id] || 0) + 1
    return acc
  }, {} as Record<number, number>) || {}
  
  const commentsByProduct = commentCounts?.reduce((acc, comment) => {
    acc[comment.product_id] = (acc[comment.product_id] || 0) + 1
    return acc
  }, {} as Record<number, number>) || {}
  
  // BusinessModel形式に変換
  return products.map(product => ({
    id: product.id.toString(),
    title: product.name,
    description: product.description || '',
    category: product.categories?.name || '',
    tags: [], // タグは別途取得が必要
    upvotes: votesByProduct[product.id] || 0,
    comments: commentsByProduct[product.id] || 0,
    author: {
      name: product.profiles?.display_name || product.profiles?.username || 'Anonymous',
      avatar: product.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${product.profiles?.username}`,
      verified: product.is_featured || false
    },
    createdAt: product.created_at,
    featured: product.is_featured || false,
    revenue: 'サブスクリプション', // デフォルト値
    difficulty: 'Medium' as const,
    timeToMarket: '1-3 months',
    initialInvestment: '10万円〜',
    targetMarket: 'ビジネスプロフェッショナル',
    image: product.thumbnail_url || '',
    website: product.product_url || undefined,
    userCount: product.view_count || 0
  }))
}

// タグ情報も含めた詳細版
export async function getProductsByCategoryWithTags(categoryId: number): Promise<BusinessModel[]> {
  const baseProducts = await getProductsByCategory(categoryId)
  
  if (baseProducts.length === 0) return []
  
  let supabase;
  try {
    supabase = await createClient()
  } catch (error) {
    // ビルド時のエラーをキャッチして静的クライアントを使用
    supabase = createStaticClient()
  }
  
  const productIds = baseProducts.map(p => parseInt(p.id))
  
  // タグ情報を取得
  const { data: productTags } = await supabase
    .from('product_tags')
    .select(`
      product_id,
      tags (
        name
      )
    `)
    .in('product_id', productIds)
  
  // タグをプロダクトごとにグループ化
  const tagsByProduct = productTags?.reduce((acc, pt: any) => {
    if (!acc[pt.product_id]) acc[pt.product_id] = []
    if (pt.tags && pt.tags.name) {
      acc[pt.product_id].push(pt.tags.name)
    }
    return acc
  }, {} as Record<number, string[]>) || {}
  
  // タグ情報を追加
  return baseProducts.map(product => ({
    ...product,
    tags: tagsByProduct[parseInt(product.id)] || []
  }))
}
