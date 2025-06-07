import { createClient } from '@/lib/supabase/client';
import { getLanguageFromCountryCode } from '@/lib/i18n';

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
  image_urls?: string[] // Added for multiple images
  country_code?: string // Added for localization
}

export async function createProduct(input: CreateProductInput) {
  const supabase = createClient()
  
  // 認証チェック
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Not authenticated') }
  }

  // 国コードを取得（入力パラメータまたは自動検出）
  const countryCode = input.country_code || (() => {
    if (typeof window === 'undefined') return 'en'
    
    // 1. ホスト名から検出（本番環境・開発環境対応）
    const hostname = window.location.hostname
    if (hostname.startsWith('ja.') || hostname.startsWith('jp.')) {
      return 'jp'
    }
    
    // 2. URLパラメータから検出（開発用）
    const urlParams = new URLSearchParams(window.location.search)
    const countryParam = urlParams.get('country')
    if (countryParam === 'jp' || countryParam === 'ja') {
      return 'jp'
    }
    
    // 3. ローカルストレージから検出（ユーザー選択を記憶）
    try {
      const storedCountry = localStorage.getItem('user-country')
      if (storedCountry === 'jp' || storedCountry === 'ja') {
        return 'jp'
      }
    } catch (e) {
      // ローカルストレージアクセスエラーは無視
    }
    
    // 4. ブラウザ言語設定から推測
    const browserLang = navigator.language || navigator.languages?.[0] || 'en'
    if (browserLang.startsWith('ja')) {
      return 'jp'
    }
    
    return 'en'
  })()

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
      country_code: countryCode,
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

  // プロダクト画像を処理
  if (input.image_urls && input.image_urls.length > 0 && product) {
    const productImagesData = input.image_urls.map((url, index) => ({
      product_id: product.id,
      image_url: url,
      display_order: index + 1, // 1-based display order
      // caption: null, // Caption can be added later if needed
    }));

    const { error: imageError } = await supabase
      .from('product_images')
      .insert(productImagesData);

    if (imageError) {
      console.error('Error inserting product images:', imageError);
      // Optionally, decide if this error should roll back product creation or just be logged
      // For now, we'll return the product but log the error.
      // Consider a transaction if atomicity is critical.
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
    console.error('Error uploading image:', {
      message: error.message || 'Unknown error',
      name: error.name,
      details: error,
    })
    return { url: null, error: error.message || 'Failed to upload image' }
  }

  // 公開URLを取得
  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName)

  return { url: publicUrl, error: null }
}
