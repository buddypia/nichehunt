import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CategoryDetailClient from './CategoryDetailClient';
import { Topic } from '@/lib/topics-client';
import { BusinessModel } from '@/types/BusinessModel';

// 静的なカテゴリデータ
const CATEGORIES = [
  { id: '1', name: 'サブスクリプション', slug: 'subscription', description: '定期購読型のビジネスモデル', icon_name: 'package' },
  { id: '2', name: 'マーケットプレイス', slug: 'marketplace', description: '売り手と買い手をつなぐプラットフォーム', icon_name: 'shopping-cart' },
  { id: '3', name: '教育・学習', slug: 'education', description: 'オンライン学習や教育関連のサービス', icon_name: 'book-open' },
  { id: '4', name: 'AI・テクノロジー', slug: 'ai-technology', description: 'AI技術を活用したサービス', icon_name: 'cpu' },
  { id: '5', name: 'ワークスペース', slug: 'workspace', description: 'オフィスやコワーキングスペース関連', icon_name: 'building' },
  { id: '6', name: 'レンタル・シェア', slug: 'rental-share', description: 'シェアリングエコノミー関連のサービス', icon_name: 'refresh-cw' },
  { id: '7', name: 'ヘルス・ウェルネス', slug: 'health-wellness', description: '健康や美容に関するサービス', icon_name: 'heart' },
  { id: '8', name: 'フード・飲食', slug: 'food', description: '食品や飲食関連のサービス', icon_name: 'utensils' },
  { id: '9', name: 'フィンテック', slug: 'fintech', description: '金融技術を活用したサービス', icon_name: 'dollar-sign' },
  { id: '10', name: 'サステナビリティ', slug: 'sustainability', description: '環境や持続可能性に関するサービス', icon_name: 'leaf' },
  { id: '11', name: 'エンターテインメント', slug: 'entertainment', description: 'ゲームや娯楽関連のサービス', icon_name: 'gamepad' },
  { id: '12', name: 'ヘルスケア', slug: 'healthcare', description: '医療や健康管理に関するサービス', icon_name: 'activity' }
];

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  const category = CATEGORIES.find(c => c.slug === slug);
  
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
  return CATEGORIES.map((category) => ({
    slug: category.slug,
  }));
}

export default async function CategoryDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const category = CATEGORIES.find(c => c.slug === slug);

  if (!category) {
    notFound();
  }

  // 静的エクスポートのため、ダミーデータを使用
  const businessModels: BusinessModel[] = [
    {
      id: '1',
      title: 'TaskFlow Pro',
      description: 'AIが自動でタスクを整理・優先順位付けする次世代タスク管理ツール',
      category: category.name,
      tags: ['React', 'TypeScript', 'Supabase', 'SaaS'],
      upvotes: 42,
      comments: 8,
      author: {
        name: 'テストユーザー1',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=testuser1',
        verified: true
      },
      revenue: 'サブスクリプション',
      difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard',
      initialInvestment: '10万円〜',
      targetMarket: 'ビジネスプロフェッショナル',
      featured: true,
      createdAt: new Date().toISOString(),
      timeToMarket: '1-3 months',
      image: '',
      website: 'https://taskflow.pro',
      userCount: 1000,
    }
  ];

  const topic: Topic = {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  return <CategoryDetailClient topic={topic} businessModels={businessModels} />;
}
