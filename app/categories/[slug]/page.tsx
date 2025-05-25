import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CategoryDetailClient from './CategoryDetailClient';
import { Topic } from '@/lib/topics-client';
import { getCategoryBySlug, getProductsByCategoryWithTags } from '@/lib/api/category-products';
import { createStaticClient } from '@/lib/supabase/static';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  const category = await getCategoryBySlug(slug);
  
  if (!category) {
    return {
      title: 'カテゴリが見つかりません - NicheHunt',
    };
  }

  return {
    title: `${category.name} - NicheHunt`,
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

  // Supabaseからカテゴリ情報を取得
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  // カテゴリに属するプロダクトを取得
  const businessModels = await getProductsByCategoryWithTags(category.id);

  // Topic形式に変換
  const topic: Topic = {
    id: category.id.toString(),
    name: category.name,
    slug: category.slug,
    description: category.description,
    created_at: category.created_at,
    updated_at: category.created_at // categoriesテーブルにupdated_atがないため
  };

  return <CategoryDetailClient topic={topic} businessModels={businessModels} />;
}
