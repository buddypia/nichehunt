import { createClient } from '@/lib/supabase/client';
import type { ProductWithRelations } from '@/lib/types/database';

export async function fetchProductById(productId: string, isStatic = false): Promise<ProductWithRelations | null> {
  try {
    // 静的生成時は静的クライアントを使用
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products_with_stats')
      .select(`
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
        ),
        images:product_images (
          id,
          image_url,
          caption,
          display_order
        )
      `)
      .eq('id', productId)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    // tagsの構造を整形
    const formattedProduct: ProductWithRelations = {
      ...data,
      tags: data.tags?.map((pt: any) => pt.tag) || [],
      images: data.images || []
    };

    return formattedProduct;
  } catch (error) {
    console.error('Error in fetchProductById:', error);
    return null;
  }
}

// ユーザーの投票状態を確認
export async function checkUserVote(productId: string, userId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('votes')
      .select('id')
      .eq('product_id', productId)
      .eq('user_id', userId)
      .single();

    return !error && !!data;
  } catch (error) {
    console.error('Error checking user vote:', error);
    return false;
  }
}
