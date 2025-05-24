'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { SubmitModal } from '@/components/SubmitModal';
import { businessModels } from '@/data/businessModels';
import Link from 'next/link';
import { 
  Zap, ShoppingBag, GraduationCap, Cpu, Building, 
  Share2, Heart, Utensils, DollarSign, Leaf, 
  Gamepad2, Stethoscope, Grid3X3 
} from 'lucide-react';

const categoryIcons: Record<string, any> = {
  'subscription': Zap,
  'marketplace': ShoppingBag,
  'education': GraduationCap,
  'ai': Cpu,
  'workspace': Building,
  'rental': Share2,
  'health': Heart,
  'food': Utensils,
  'finance': DollarSign,
  'sustainability': Leaf,
  'entertainment': Gamepad2,
  'healthcare': Stethoscope,
};

const categories = [
  { id: 'subscription', name: 'サブスクリプション', color: 'from-purple-500 to-pink-500' },
  { id: 'marketplace', name: 'マーケットプレイス', color: 'from-blue-500 to-cyan-500' },
  { id: 'education', name: '教育・学習', color: 'from-green-500 to-emerald-500' },
  { id: 'ai', name: 'AI・テクノロジー', color: 'from-indigo-500 to-purple-500' },
  { id: 'workspace', name: 'ワークスペース', color: 'from-orange-500 to-red-500' },
  { id: 'rental', name: 'レンタル・シェア', color: 'from-teal-500 to-green-500' },
  { id: 'health', name: 'ヘルス・ウェルネス', color: 'from-pink-500 to-rose-500' },
  { id: 'food', name: 'フード・飲食', color: 'from-yellow-500 to-orange-500' },
  { id: 'finance', name: 'フィンテック', color: 'from-blue-600 to-indigo-600' },
  { id: 'sustainability', name: 'サステナビリティ', color: 'from-green-600 to-teal-600' },
  { id: 'entertainment', name: 'エンターテインメント', color: 'from-purple-600 to-pink-600' },
  { id: 'healthcare', name: 'ヘルスケア', color: 'from-red-500 to-pink-500' },
];

export default function CategoriesPage() {
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // カテゴリごとのモデル数を計算
  const categoryCounts = categories.map(category => {
    const count = businessModels.filter(model => {
      const normalizedCategory = model.category.replace('・', '');
      const categoryNormalized = category.id.replace('・', '');
      return model.category === category.id || 
             normalizedCategory.includes(categoryNormalized) ||
             categoryNormalized.includes(normalizedCategory);
    }).length;
    return { ...category, count };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header onSubmitClick={() => setIsSubmitModalOpen(true)} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Grid3X3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">カテゴリー</h1>
              <p className="text-gray-600">興味のあるカテゴリーからビジネスモデルを探す</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryCounts.map((category) => {
            const Icon = categoryIcons[category.id] || Grid3X3;
            return (
              <Link
                key={category.id}
                href={`/?category=${category.id}`}
                className="group relative overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 bg-gradient-to-r ${category.color} rounded-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{category.count}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-sm text-gray-600">
                    {category.count}件のビジネスモデル
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            探しているカテゴリーが見つかりませんか？
          </p>
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
          >
            新しいビジネスモデルを投稿する
          </button>
        </div>
      </main>

      <SubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
      />
    </div>
  );
}
