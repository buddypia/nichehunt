import { createClient } from '@/lib/supabase-client'
import type { Product, Tag } from '@/lib/types/database'

interface CreateProductInput {
  name: string
  tagline: string
  description: string
  product_url?: string
  github_url?: string
  demo_url?: string
  thumbnail_url?: string
  category_id: number
  tags?: string[]
  launch_date?: string
}

export async function createProduct(input: CreateProductInput) {
  const supabase = createClient()
  
  // 認証チェック
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Not authenticated') }
  }

  // プロダクトを作成
  const { data: product, error: productError } = await supabase
    .from('products')
    .insert({
      user_id: user.id,
      name: input.name,
      tagline: input.tagline,
      description: input.description,
      product_url: input.product_url || null,
      github_url: input.github_url || null,
      demo_url: input.demo_url || null,
      thumbnail_url: input.thumbnail_url || null,
      category_id: input.category_id,
      status: 'published' as const,
      launch_date: input.launch_date || new Date().toISOString(),
    })
    .select()
    .single()

  if (productError || !product) {
    console.error('Error creating product:', productError)
    return { data: null, error: productError }
  }

  // タグを処理
  if (input.tags && input.tags.length > 0) {
    // 既存のタグを検索
    const { data: existingTags } = await supabase
      .from('tags')
      .select('id, name')
      .in('name', input.tags)

    const existingTagNames = existingTags?.map(t => t.name) || []
    const existingTagIds = existingTags?.map(t => t.id) || []

    // 新しいタグを作成
    const newTagNames = input.tags.filter(tag => !existingTagNames.includes(tag))
    if (newTagNames.length > 0) {
      const newTags = newTagNames.map(name => ({
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-')
      }))

      const { data: createdTags } = await supabase
        .from('tags')
        .insert(newTags)
        .select('id')

      if (createdTags) {
        existingTagIds.push(...createdTags.map(t => t.id))
      }
    }

    // プロダクトとタグを関連付け
    if (existingTagIds.length > 0) {
      const productTags = existingTagIds.map(tagId => ({
        product_id: product.id,
        tag_id: tagId
      }))

      await supabase
        .from('product_tags')
        .insert(productTags)
    }
  }

  return { data: product, error: null }
}

// 画像をアップロード
export async function uploadProductImage(file: File): Promise<{ url: string | null, error: any }> {
  const supabase = createClient()
  
  // 認証チェック
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { url: null, error: new Error('Not authenticated') }
  }

  // ファイル名を生成
  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/${Date.now()}.${fileExt}`

  // Supabase Storageにアップロード
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file)

  if (error) {
    console.error('Error uploading image:', error)
    return { url: null, error }
  }

  // 公開URLを取得
  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName)

  return { url: publicUrl, error: null }
}
