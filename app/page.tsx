'use client';

import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { BusinessModelCard } from '@/components/BusinessModelCard';
import { CategoryNavbar } from '@/components/CategoryNavbar';
import { SearchStats } from '@/components/SearchStats';
import { SubmitModal } from '@/components/SubmitModal';
import { SortOption } from '@/components/RankingSort';
import { BusinessModel } from '@/types/BusinessModel';
import { fetchBusinessModels, fetchBusinessModelsByCategory, searchBusinessModels, testSupabaseConnection, fetchTodaysBusinessModels } from '@/lib/db-helpers';

const categories = [
  { id: 'all', name: 'すべて' },
  { id: 'subscription', name: 'サブスクリプション' },
  { id: 'marketplace', name: 'マーケットプレイス' },
  { id: 'education', name: '教育・学習' },
  { id: 'ai-technology', name: 'AI・テクノロジー' },
  { id: 'workspace', name: 'ワークスペース' },
  { id: 'rental-share', name: 'レンタル・シェア' },
  { id: 'health-wellness', name: 'ヘルス・ウェルネス' },
  { id: 'food', name: 'フード・飲食' },
  { id: 'fintech', name: 'フィンテック' },
  { id: 'sustainability', name: 'サステナビリティ' },
  { id: 'entertainment', name: 'エンターテインメント' },
  { id: 'healthcare', name: 'ヘルスケア' }
];

export default function Home() {
  const [businessModels, setBusinessModels] = useState<BusinessModel[]>([]);
  const [filteredModels, setFilteredModels] = useState<BusinessModel[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<SortOption>('popular');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isShowingTodaysModels, setIsShowingTodaysModels] = useState(false);
  const [searchStats, setSearchStats] = useState({
    topCategory: '',
    avgUpvotes: 0,
    avgComments: 0
  });

  // Fetch business models from database
  useEffect(() => {
    const loadBusinessModels = async () => {
      setIsLoading(true);
      
      try {
        let models: BusinessModel[] = [];
        let showingTodays = false;
        
        if (searchQuery) {
          models = await searchBusinessModels(searchQuery);
        } else if (selectedCategory === 'all') {
          models = await fetchTodaysBusinessModels();
          showingTodays = true;
          
          // If no models found for today, fetch all models
          if (models.length === 0) {
            models = await fetchBusinessModels();
            showingTodays = false;
          }
        } else {
          models = await fetchBusinessModelsByCategory(selectedCategory);
        }
        
        setBusinessModels(models);
        setIsShowingTodaysModels(showingTodays);
        
        // 検索結果の統計情報を計算
        if (searchQuery && models.length > 0) {
          // カテゴリの集計
          const categoryCounts: Record<string, number> = {};
          models.forEach(model => {
            if (model.category) {
              categoryCounts[model.category] = (categoryCounts[model.category] || 0) + 1;
            }
          });
          
          // 最も多いカテゴリを見つける
          const topCat = Object.entries(categoryCounts)
            .sort(([, a], [, b]) => b - a)[0]?.[0] || '';
          
          // 平均値を計算
          const avgUpvotes = models.reduce((sum, m) => sum + m.upvotes, 0) / models.length;
          const avgComments = models.reduce((sum, m) => sum + m.comments, 0) / models.length;
          
          setSearchStats({
            topCategory: categories.find(c => c.id === topCat)?.name || topCat,
            avgUpvotes,
            avgComments
          });
        }
      } catch (error) {
        console.error('Error loading business models:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBusinessModels();
  }, [selectedCategory, searchQuery]);

  // Sort models
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
        sorted.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return b.upvotes - a.upvotes;
        });
        break;
    }

    return sorted;
  }, [businessModels, selectedSort]);

  useEffect(() => {
    setFilteredModels(sortedModels);
  }, [sortedModels]);

  // Get display title based on current view
  const getDisplayTitle = () => {
    if (searchQuery) {
      return `「${searchQuery}」の検索結果`;
    } else if (selectedCategory === 'all') {
      if (isShowingTodaysModels) {
        const today = new Date();
        const dateStr = today.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' });
        return '注目ビジネスモデル';
      } else {
        return 'すべてのビジネスモデル';
      }
    } else {
      return `${categories.find(c => c.id === selectedCategory)?.name || selectedCategory}のビジネスモデル`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header 
        onSubmitClick={() => setIsSubmitModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryFilter={setSelectedCategory}
      />
      <CategoryNavbar 
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedSort={selectedSort}
        onSortChange={setSelectedSort}
      />
      <Hero />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full">
            {/* 検索統計情報 */}
            {searchQuery && (
              <SearchStats
                query={searchQuery}
                resultCount={filteredModels.length}
                topCategory={searchStats.topCategory}
                avgUpvotes={searchStats.avgUpvotes}
                avgComments={searchStats.avgComments}
              />
            )}
            
            <div className="mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {getDisplayTitle()}
                </h2>
                <p className="text-gray-600">
                  {filteredModels.length}件のニッチなビジネスモデルが見つかりました
                </p>
                {isShowingTodaysModels && selectedCategory === 'all' && !searchQuery && (
                  <p className="text-sm text-blue-600 mt-1">
                    今日の注目ピックアップを表示中
                  </p>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="grid gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
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
              </>
            )}
        </div>
      </main>

      <SubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
      />
    </div>
  );
}
