import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetailClient } from './ProductDetailClient';
import { fetchProductById } from '@/lib/api/products-detail';
import { createStaticClient } from '@/lib/supabase/static';

interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProductById(id, true); // 静的生成時は true を渡す
  
  if (!product) {
    return {
      title: 'プロダクトが見つかりません - NicheNext',
      description: '指定されたプロダクトが見つかりませんでした。',
    };
  }
  
  return {
    title: `${product.name} - NicheNext`,
    description: product.tagline || 'プロダクトの詳細情報',
  };
}

export async function generateStaticParams() {
  const supabase = createStaticClient();
  
  try {
    // Supabaseから実際のプロダクトIDを取得
    const { data: products, error } = await supabase
      .from('products')
      .select('id')
      .order('id', { ascending: true });
    
    if (error) {
      console.error('Error fetching product IDs:', error);
      return [];
    }
    
    // IDパラメータの配列を返す
    return (products || []).map((product) => ({
      id: product.id.toString(),
    }));
  } catch (error) {
    console.error('Error in generateStaticParams:', error);
    return [];
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  
  // 静的生成時は常にtrueを渡す
  const product = await fetchProductById(id, true);
  
  if (!product) {
    notFound();
  }
  
  // 静的エクスポートのため、ユーザー固有の情報は含めない
  const productWithVoteStatus = {
    ...product,
    has_voted: false,
  };

  return <ProductDetailClient initialProduct={productWithVoteStatus} />;
}
