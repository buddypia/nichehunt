import { supabase } from '@/lib/supabase-client';

interface TagWithCount {
  id: number;
  name: string;
  slug: string;
  product_count: number;
}

export async function getPopularTags(limit: number = 6): Promise<string[]> {
  try {
    // まず全てのタグを取得
    const { data: tags, error: tagsError } = await supabase
      .from('tags')
      .select('*');

    if (tagsError) {
      console.error('Error fetching tags:', tagsError);
      return [];
    }

    if (!tags || tags.length === 0) {
      return [];
    }

    // 各タグのプロダクト数をカウント
    const tagsWithCount: TagWithCount[] = await Promise.all(
      tags.map(async (tag) => {
        const { count, error: countError } = await supabase
          .from('product_tags')
          .select('*', { count: 'exact', head: true })
          .eq('tag_id', tag.id);

        if (countError) {
          console.error(`Error counting products for tag ${tag.id}:`, countError);
          return { ...tag, product_count: 0 };
        }

        return {
          ...tag,
          product_count: count || 0,
        };
      })
    );

    // プロダクト数でソートして上位を返す
    return tagsWithCount
      .sort((a, b) => b.product_count - a.product_count)
      .slice(0, limit)
      .map(tag => tag.name);
  } catch (error) {
    console.error('Error in getPopularTags:', error);
    return [];
  }
}

// 全てのタグを取得（検索候補用）
export async function getAllTags(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('tags')
      .select('name')
      .order('name');

    if (error) {
      console.error('Error fetching all tags:', error);
      return [];
    }

    return data?.map(tag => tag.name) || [];
  } catch (error) {
    console.error('Error in getAllTags:', error);
    return [];
  }
}
