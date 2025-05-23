'use client';

import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { BusinessModelCard } from '@/components/BusinessModelCard';
import { CategoryFilter } from '@/components/CategoryFilter';
import { CategoryNavbar } from '@/components/CategoryNavbar';
import { SearchBar } from '@/components/SearchBar';
import { SubmitModal } from '@/components/SubmitModal';
import { SortOption } from '@/components/RankingSort';
import { businessModels } from '@/data/businessModels';
import { BusinessModel } from '@/types/BusinessModel';

const categories = [
  { id: 'all', name: 'すべて' },
  { id: 'subscription', name: 'サブスクリプション' },
  { id: 'marketplace', name: 'マーケットプレイス' },
  { id: 'education', name: '教育・学習' },
  { id: 'ai', name: 'AI・テクノロジー' },
  { id: 'workspace', name: 'ワークスペース' },
  { id: 'rental', name: 'レンタル・シェア' },
  { id: 'health', name: 'ヘルス・ウェルネス' },
  { id: 'food', name: 'フード・飲食' },
  { id: 'finance', name: 'フィンテック' },
  { id: 'sustainability', name: 'サステナビリティ' },
  { id: 'entertainment', name: 'エンターテインメント' },
  { id: 'healthcare', name: 'ヘルスケア' }
];

export default function Home() {
  const [filteredModels, setFilteredModels] = useState<BusinessModel[]>(businessModels);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<SortOption>('popular');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // ソート済みのモデルを計算
  const sortedModels = useMemo(() => {
    let sorted = [...businessModels];

    switch (selectedSort) {
      case 'popular':
        sorted.sort((a, b) => b.upvotes - a.upvotes);
        break;
      case 'newest':
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'comments':
        sorted.sort((a, b) => b.comments - a.comments);
        break;
      case 'featured':
        // 注目フラグがあるものを上位に、その後はアップボート数でソート
        sorted.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return b.upvotes - a.upvotes;
        });
        break;
    }

    return sorted;
  }, [selectedSort]);

  useEffect(() => {
    let filtered = sortedModels;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(model => {
        // カテゴリーの正規化（エンターテインメント、ヘルスケアなど）
        const normalizedCategory = model.category.replace('・', '');
        const selectedNormalized = selectedCategory.replace('・', '');
        return model.category === selectedCategory || 
               normalizedCategory.includes(selectedNormalized) ||
               selectedNormalized.includes(normalizedCategory);
      });
    }

    if (searchQuery) {
      filtered = filtered.filter(model =>
        model.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredModels(filtered);
  }, [selectedCategory, searchQuery, sortedModels]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header onSubmitClick={() => setIsSubmitModalOpen(true)} />
      <CategoryNavbar 
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedSort={selectedSort}
        onSortChange={setSelectedSort}
      />
      <Hero />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-80">
            <div className="sticky top-32 space-y-6">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
              <div className="lg:hidden">
                <CategoryFilter
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                />
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedCategory === 'all' ? '今日のビジネスモデル' : 
                   `${categories.find(c => c.id === selectedCategory)?.name || selectedCategory}のビジネスモデル`}
                </h2>
                <p className="text-gray-600">
                  {filteredModels.length}件のニッチなビジネスモデルが見つかりました
                </p>
              </div>
            </div>

            <div className="grid gap-6">
              {filteredModels.map((model, index) => (
                <BusinessModelCard
                  key={model.id}
                  model={model}
                  rank={index + 1}
                />
              ))}
            </div>

            {filteredModels.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  該当するビジネスモデルが見つかりません
                </h3>
                <p className="text-gray-600">
                  検索条件を変更するか、新しいビジネスモデルを投稿してみてください
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <SubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
      />
    </div>
  );
}
