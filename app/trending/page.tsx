import { Metadata } from 'next'
import { TrendingClient } from './TrendingClient'
import { createClient } from '@/lib/supabase/server'
import type { ProductWithRelations } from '@/lib/types/database'

export const metadata: Metadata = {
  title: 'トレンド | NicheNext',
  description: '話題のビジネスモデルをチェック'
}

export default async function TrendingPage() {
  const supabase = await createClient()

  // トレンドプロダクトを取得（デフォルトは今週）
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const { data: trendingProducts } = await supabase
    .from('products_with_stats')
    .select('*')
    .eq('status', 'published')
    .gte('launch_date', weekAgo.toISOString())
    .order('vote_count', { ascending: false })
    .limit(20)

  // プロファイル情報を追加
  const enrichedProducts = await Promise.all((trendingProducts || []).map(async (product) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', product.user_id)
      .single()
    
    const { data: category } = await supabase
      .from('categories')
      .select('*')
      .eq('id', product.category_id)
      .single()

    const { data: productTags } = await supabase
      .from('product_tags')
      .select('tag_id')
      .eq('product_id', product.id)

    let tags: any[] = []
    if (productTags && productTags.length > 0) {
      const tagIds = productTags.map((pt: any) => pt.tag_id)
      
      if (tagIds.length > 0) {
        const { data: tagData } = await supabase
          .from('tags')
          .select('*')
          .in('id', tagIds)
        tags = tagData || []
      }
    }

    return {
      ...product,
      profile,
      category,
      tags,
    } as ProductWithRelations
  }))

  return <TrendingClient initialProducts={enrichedProducts} />
}
