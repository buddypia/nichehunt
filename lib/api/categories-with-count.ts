import { supabase } from '@/lib/supabase-client';
import { Category } from '@/lib/types/database';

export interface CategoryWithCount extends Category {
  product_count: number;
}

export async function fetchCategoriesWithCount(): Promise<{ data: CategoryWithCount[], error: any }> {
  try {
    // カテゴリー一覧を取得
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      return { data: [], error: categoriesError };
    }

    if (!categories || categories.length === 0) {
      return { data: [], error: null };
    }

    // 各カテゴリーのプロダクト数を取得
    const categoriesWithCount: CategoryWithCount[] = await Promise.all(
      categories.map(async (category) => {
        const { count, error: countError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', category.id)
          .eq('status', 'published');

        if (countError) {
          console.error(`Error counting products for category ${category.id}:`, countError);
          return { ...category, product_count: 0 };
        }

        return {
          ...category,
          product_count: count || 0,
        };
      })
    );

    return { data: categoriesWithCount, error: null };
  } catch (error) {
    console.error('Error in fetchCategoriesWithCount:', error);
    return { data: [], error };
  }
}
