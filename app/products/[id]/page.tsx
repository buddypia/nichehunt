import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetailClient } from './ProductDetailClient';

interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  
  return {
    title: `プロダクト詳細 - NicheHunt`,
    description: 'プロダクトの詳細情報',
  };
}

export async function generateStaticParams() {
  // 静的エクスポートのため、1-20のIDを生成
  return Array.from({ length: 20 }, (_, i) => ({
    id: String(i + 1)
  }));
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;

  // 静的エクスポートのため、ダミーデータを使用
  const dummyProduct = {
    id: parseInt(id),
    name: 'TaskFlow Pro',
    tagline: 'AIが自動でタスクを整理・優先順位付けする次世代タスク管理ツール',
    description: 'TaskFlow Proは、機械学習を活用してあなたのタスクを自動的に整理し、最適な優先順位を提案する革新的なタスク管理ツールです。',
    thumbnail_url: null,
    product_url: 'https://taskflow.pro',
    github_url: null,
    demo_url: null,
    launch_date: new Date().toISOString(),
    status: 'published' as const,
    is_featured: true,
    vote_count: 42,
    comment_count: 8,
    has_voted: false,
    profile: {
      id: '1',
      username: 'testuser1',
      display_name: 'テストユーザー1',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=testuser1',
      bio: null,
    },
    category: {
      id: '1',
      name: 'AI・テクノロジー',
      slug: 'ai-technology',
    },
    tags: [],
    images: [],
  };

  return <ProductDetailClient initialProduct={dummyProduct as any} />;
}
