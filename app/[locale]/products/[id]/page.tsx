import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetailClient } from '../../../products/[id]/ProductDetailClient';
import { fetchProductById } from '@/lib/api/products-detail';
import { createClient } from '@/lib/supabase/client';

interface ProductDetailPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { id, locale } = await params;
  const product = await fetchProductById(id, true); // 静的生成時は true を渡す
  
  if (!product) {
    if (locale === 'ja') {
      return {
        title: 'プロダクトが見つかりません - NicheNext',
        description: '指定されたプロダクトが見つかりませんでした。',
      };
    }
    return {
      title: 'Product not found - NicheNext',
      description: 'The specified product was not found.',
    };
  }
  
  return {
    title: `${product.name} - NicheNext`,
    description: product.tagline || (locale === 'ja' ? 'プロダクトの詳細情報' : 'Product details'),
  };
}

export async function generateStaticParams() {
  const supabase = createClient();
  
  try {
    // Supabaseから実際のプロダクトIDを取得
    const { data: products, error } = await supabase
      .from('products')
      .select('id')
      .order('id', { ascending: true });
    
    if (error) {
      return [];
    }
    
    // locale と id パラメータの組み合わせを返す
    const locales = ['ja', 'en'];
    const params: { locale: string; id: string }[] = [];
    
    for (const locale of locales) {
      for (const product of products || []) {
        params.push({
          locale,
          id: product.id.toString(),
        });
      }
    }
    
    return params;
  } catch (error) {
    return [];
  }
}

export default async function LocaleProductDetailPage({ params }: ProductDetailPageProps) {
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