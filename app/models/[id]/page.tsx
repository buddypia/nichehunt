import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ModelDetailClient from './ModelDetailClient';
import { BusinessModel } from '@/types/BusinessModel';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  
  return {
    title: `ビジネスモデル詳細 - NicheHunt`,
    description: 'ビジネスモデルの詳細情報',
  };
}

export async function generateStaticParams() {
  // 静的エクスポートのため、いくつかのダミーIDを生成
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ];
}

export default async function BusinessModelDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  // 静的エクスポートのため、ダミーデータを使用
  const dummyModel: BusinessModel = {
    id: id,
    title: 'TaskFlow Pro',
    description: 'AIが自動でタスクを整理・優先順位付けする次世代タスク管理ツール',
    category: 'AI・テクノロジー',
    tags: ['React', 'TypeScript', 'Supabase', 'SaaS'],
    upvotes: 42,
    comments: 8,
    author: {
      name: 'テストユーザー1',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=testuser1',
      verified: true
    },
    revenue: 'サブスクリプション',
    difficulty: 'Medium' as const,
    initialInvestment: '10万円〜',
    targetMarket: 'ビジネスプロフェッショナル',
    featured: true,
    createdAt: new Date().toISOString(),
    timeToMarket: '1-3 months',
    image: '',
    website: 'https://taskflow.pro',
    userCount: 1000,
  };

  return <ModelDetailClient model={dummyModel} />;
}
