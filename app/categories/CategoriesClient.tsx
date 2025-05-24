'use client';

import Link from 'next/link';
import { 
  Zap, ShoppingBag, GraduationCap, Cpu, Building, 
  Share2, Heart, Utensils, DollarSign, Leaf, 
  Gamepad2, Stethoscope, Grid3X3, Package,
  Briefcase, Coffee, BookOpen, Activity
} from 'lucide-react';
import { CategoryWithCount } from '@/lib/api/categories-with-count';

const categoryIcons: Record<string, any> = {
  'subscription': Zap,
  'marketplace': ShoppingBag,
  'education': GraduationCap,
  'ai-technology': Cpu,
  'workspace': Building,
  'rental-share': Share2,
  'health-wellness': Heart,
  'food': Utensils,
  'fintech': DollarSign,
  'sustainability': Leaf,
  'entertainment': Gamepad2,
  'healthcare': Stethoscope,
  'package': Package,
  'cpu': Cpu,
  'shopping-cart': ShoppingBag,
  'book-open': BookOpen,
  'building': Building,
  'refresh-cw': Share2,
  'heart': Heart,
  'utensils': Utensils,
  'dollar-sign': DollarSign,
  'leaf': Leaf,
  'gamepad': Gamepad2,
  'activity': Activity
};

const categoryColors: Record<string, string> = {
  'subscription': 'from-purple-500 to-pink-500',
  'marketplace': 'from-blue-500 to-cyan-500',
  'education': 'from-green-500 to-emerald-500',
  'ai-technology': 'from-indigo-500 to-purple-500',
  'workspace': 'from-orange-500 to-red-500',
  'rental-share': 'from-teal-500 to-green-500',
  'health-wellness': 'from-pink-500 to-rose-500',
  'food': 'from-yellow-500 to-orange-500',
  'fintech': 'from-blue-600 to-indigo-600',
  'sustainability': 'from-green-600 to-teal-600',
  'entertainment': 'from-purple-600 to-pink-600',
  'healthcare': 'from-red-500 to-pink-500',
};

interface CategoriesClientProps {
  categories: CategoryWithCount[];
}

export default function CategoriesClient({ categories }: CategoriesClientProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Grid3X3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">カテゴリー</h1>
              <p className="text-gray-600">興味のあるカテゴリーからプロダクトを探す</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const Icon = categoryIcons[category.slug] || categoryIcons[category.icon_name || ''] || Grid3X3;
            const color = categoryColors[category.slug] || 'from-gray-500 to-gray-600';
            
            return (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group relative overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 bg-gradient-to-r ${color} rounded-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{category.product_count}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {category.product_count}件のプロダクト
                  </p>
                  {category.description && (
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <div className="p-4 bg-gray-100 rounded-lg inline-block mb-4">
              <Grid3X3 className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              カテゴリーがまだありません
            </h3>
            <p className="text-gray-600">
              最初のプロダクトを投稿してみましょう！
            </p>
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            探しているカテゴリーが見つかりませんか？
          </p>
          <p className="text-gray-600">
            新しいプロダクトを投稿するには、右上の「投稿する」ボタンをクリックしてください。
          </p>
        </div>
      </main>
    </div>
  );
}
