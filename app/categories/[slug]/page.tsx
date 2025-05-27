import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CategoryDetailClient from './CategoryDetailClient';
import { getCategoryBySlug } from '@/lib/api/category-products';
import { createStaticClient } from '@/lib/supabase/static';
import { createClient } from '@/lib/supabase/server';
import type { ProductWithRelations } from '@/lib/types/database';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  const category = await getCategoryBySlug(slug);
  
  if (!category) {
    return {
      title: 'カテゴリが見つかりません - NicheNext',
    };
  }

  return {
    title: `${category.name} - NicheNext`,
    description: category.description || `${category.name}カテゴリのビジネスモデル一覧`,
  };
}

export async function generateStaticParams() {
  const supabase = createStaticClient();
  const { data: categories } = await supabase
    .from('categories')
    .select('slug')
    .order('id');

  return categories?.map((category) => ({
    slug: category.slug,
  })) || [];
}

export default async function CategoryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Supabaseからカテゴリ情報を取得
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  // カテゴリに属するプロダクトを取得（人気順）
  const { data: productsData } = await supabase
    .from('products_with_stats')
    .select('*')
    .eq('status', 'published')
    .eq('category_id', category.id)
    .order('vote_count', { ascending: false })
    .limit(20);

  // カテゴリ内の注目プロダクトを取得
  const { data: featuredData } = await supabase
    .from('products_with_stats')
    .select('*')
    .eq('status', 'published')
    .eq('category_id', category.id)
    .eq('featured', true)
    .order('launch_date', { ascending: false })
    .limit(3);

  // プロダクトに関連情報を追加
  const enrichProducts = async (products: any[]): Promise<ProductWithRelations[]> => {
    return await Promise.all((products || []).map(async (product) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', product.user_id)
        .single();

      const { data: productTags } = await supabase
        .from('product_tags')
        .select('tag_id')
        .eq('product_id', product.id);

      let tags: any[] = [];
      if (productTags && productTags.length > 0) {
        const tagIds = productTags.map(pt => pt.tag_id);
        const { data: tagData } = await supabase
          .from('tags')
          .select('*')
          .in('id', tagIds);
        tags = tagData || [];
      }

      return {
        ...product,
        profile,
        category,
        tags,
      } as ProductWithRelations;
    }));
  };

  const initialProducts = await enrichProducts(productsData || []);
  const featuredProducts = await enrichProducts(featuredData || []);

  return (
    <CategoryDetailClient 
      category={category}
      initialProducts={initialProducts}
      featuredProducts={featuredProducts}
    />
  );
}
