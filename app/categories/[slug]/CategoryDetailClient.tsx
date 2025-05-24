'use client';

import { useState } from 'react';
import { BusinessModelCard } from '@/components/BusinessModelCard';
import { SearchBar } from '@/components/SearchBar';
import { Topic } from '@/lib/topics-client';
import { BusinessModel } from '@/types/BusinessModel';
import { 
  Zap, ShoppingBag, GraduationCap, Cpu, Building, 
  Share2, Heart, Utensils, DollarSign, Leaf, 
  Gamepad2, Stethoscope, Package, ChevronLeft,
  TrendingUp, Clock, MessageSquare
} from 'lucide-react';
import Link from 'next/link';

const categoryIcons: Record<string, any> = {
  'サブスクリプション': Zap,
  'マーケットプレイス': ShoppingBag,
  '教育・学習': GraduationCap,
  'AI・テクノロジー': Cpu,
  'ワークスペース': Building,
  'レンタル・シェア': Share2,
  'ヘルス・ウェルネス': Heart,
  'フード・飲食': Utensils,
  'フィンテック': DollarSign,
  'サステナビリティ': Leaf,
  'エンターテインメント': Gamepad2,
  'ヘルスケア': Stethoscope,
  'その他': Package
};

const categoryColors: Record<string, string> = {
  'サブスクリプション': 'from-purple-500 to-pink-500',
  'マーケットプレイス': 'from-blue-500 to-cyan-500',
  '教育・学習': 'from-green-500 to-emerald-500',
  'AI・テクノロジー': 'from-indigo-500 to-purple-500',
  'ワークスペース': 'from-orange-500 to-red-500',
  'レンタル・シェア': 'from-teal-500 to-green-500',
  'ヘルス・ウェルネス': 'from-pink-500 to-rose-500',
  'フード・飲食': 'from-yellow-500 to-orange-500',
  'フィンテック': 'from-blue-600 to-indigo-600',
  'サステナビリティ': 'from-green-600 to-teal-600',
  'エンターテインメント': 'from-purple-600 to-pink-600',
  'ヘルスケア': 'from-red-500 to-pink-500',
  'その他': 'from-gray-500 to-gray-600'
};

type SortType = 'popular' | 'newest' | 'comments';

interface CategoryDetailClientProps {
  topic: Topic;
  businessModels: BusinessModel[];
}

export default function CategoryDetailClient({ topic, businessModels }: CategoryDetailClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('popular');

  const Icon = categoryIcons[topic.name] || Package;
  const color = categoryColors[topic.name] || 'from-gray-500 to-gray-600';

  // 検索フィルタリング
  const filteredModels = businessModels.filter(model => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      model.title.toLowerCase().includes(query) ||
      model.description.toLowerCase().includes(query) ||
      model.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  // ソート
  const sortedModels = [...filteredModels].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'comments':
        return b.comments - a.comments;
      case 'popular':
      default:
        return b.upvotes - a.upvotes;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* パンくずリスト */}
        <div className="mb-6">
          <Link href="/categories" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ChevronLeft className="w-4 h-4 mr-1" />
            カテゴリー一覧に戻る
          </Link>
        </div>

        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-4 bg-gradient-to-r ${color} rounded-xl`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{topic.name}</h1>
              <p className="text-gray-600">{sortedModels.length}件のビジネスモデル</p>
            </div>
          </div>
          {topic.description && (
            <p className="text-gray-600 mt-4">{topic.description}</p>
          )}
        </div>

        {/* 検索とソート */}
        <div className="mb-8 space-y-4">
          <SearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={`${topic.name}のビジネスモデルを検索...`}
          />
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredModels.length !== businessModels.length && (
                <span>{filteredModels.length}件の検索結果 / </span>
              )}
              全{businessModels.length}件
            </p>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">並び替え:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy('popular')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === 'popular'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  人気順
                </button>
                <button
                  onClick={() => setSortBy('newest')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === 'newest'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Clock className="w-3 h-3 inline mr-1" />
                  新着順
                </button>
                <button
                  onClick={() => setSortBy('comments')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === 'comments'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <MessageSquare className="w-3 h-3 inline mr-1" />
                  コメント順
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ビジネスモデル一覧 */}
        {sortedModels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedModels.map((model) => (
              <BusinessModelCard key={model.id} model={model} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              {searchQuery
                ? `「${searchQuery}」に一致するビジネスモデルが見つかりませんでした。`
                : `${topic.name}のビジネスモデルはまだ投稿されていません。`}
            </p>
            <p className="text-blue-600">
              最初のビジネスモデルを投稿するには、上部の「投稿する」ボタンをクリックしてください。
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
