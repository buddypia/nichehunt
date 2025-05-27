'use client';

import { useState, useEffect, useMemo } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { TrendingUp, Clock, MessageSquare, Award, Trophy, Medal, Sparkles, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase-client';
import type { ProductWithRelations } from '@/lib/types/database';

type TrendingPeriod = 'today' | 'week' | 'month';

interface TrendingClientProps {
  initialProducts: ProductWithRelations[]
}

export function TrendingClient({ initialProducts }: TrendingClientProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TrendingPeriod>('week');
  const [products, setProducts] = useState<ProductWithRelations[]>(initialProducts);
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    // 初回レンダリング時は initialProducts を使用するため、
    // selectedPeriod が変更された時のみ新しいデータを取得
    if (!isFirstLoad) {
      fetchTrendingProducts();
    } else {
      setIsFirstLoad(false);
    }
  }, [selectedPeriod]);

  const fetchTrendingProducts = async () => {
    setIsLoading(true);
    try {
      // 期間でフィルタリング用の日付を計算
      const now = new Date();
      let dateFilter: string;
      
      switch (selectedPeriod) {
        case 'today':
          const today = new Date(now);
          today.setHours(0, 0, 0, 0);
          dateFilter = today.toISOString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateFilter = weekAgo.toISOString();
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          dateFilter = monthAgo.toISOString();
          break;
      }

      // 1. まず製品データを取得
      const { data: products, error: productsError } = await supabase
        .from('products_with_stats')
        .select('*')
        .eq('status', 'published')
        .gte('launch_date', dateFilter)
        .order('vote_count', { ascending: false })
        .limit(20);

      if (productsError) {
        console.error('Error fetching trending products:', productsError);
        return;
      }

      if (!products || products.length === 0) {
        setProducts([]);
        return;
      }

      // 2. 必要なIDを収集
      const userIds = Array.from(new Set(products.map(p => p.user_id)));
      const categoryIds = Array.from(new Set(products.map(p => p.category_id).filter(Boolean)));
      const productIds = products.map(p => p.id);

      // 3. バッチで関連データを取得
      const [profilesResult, categoriesResult, productTagsResult] = await Promise.all([
        // プロファイル情報を一括取得
        supabase.from('profiles').select('*').in('id', userIds),
        // カテゴリ情報を一括取得
        categoryIds.length > 0 
          ? supabase.from('categories').select('*').in('id', categoryIds)
          : Promise.resolve({ data: [], error: null }),
        // プロダクトタグ情報を一括取得
        supabase.from('product_tags').select('product_id, tag_id').in('product_id', productIds)
      ]);

      if (profilesResult.error || categoriesResult.error || productTagsResult.error) {
        console.error('Error fetching related data:', {
          profiles: profilesResult.error,
          categories: categoriesResult.error,
          productTags: productTagsResult.error
        });
        return;
      }

      // 4. タグIDを収集してタグ情報を一括取得
      const tagIds = Array.from(new Set(productTagsResult.data?.map(pt => pt.tag_id) || []));
      let tagsData: any[] = [];
      
      if (tagIds.length > 0) {
        const { data: tags, error: tagsError } = await supabase
          .from('tags')
          .select('*')
          .in('id', tagIds);
        
        if (!tagsError && tags) {
          tagsData = tags;
        }
      }

      // 5. データをマッピング用のオブジェクトに変換
      const profilesMap = new Map(profilesResult.data?.map(p => [p.id, p]) || []);
      const categoriesMap = new Map(categoriesResult.data?.map(c => [c.id, c]) || []);
      const tagsMap = new Map(tagsData.map(t => [t.id, t]));
      
      // product_id -> tag_ids のマッピングを作成
      const productTagsMap = new Map<number, number[]>();
      productTagsResult.data?.forEach(pt => {
        if (!productTagsMap.has(pt.product_id)) {
          productTagsMap.set(pt.product_id, []);
        }
        productTagsMap.get(pt.product_id)!.push(pt.tag_id);
      });

      // 6. 製品データに関連情報を結合
      const enrichedProducts = products.map(product => {
        const tagIds = productTagsMap.get(product.id) || [];
        const tags = tagIds.map(tagId => tagsMap.get(tagId)).filter(Boolean);

        return {
          ...product,
          profile: profilesMap.get(product.user_id) || null,
          category: product.category_id ? categoriesMap.get(product.category_id) || null : null,
          tags,
        } as ProductWithRelations;
      });

      setProducts(enrichedProducts);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = (productId: number) => {
    // 楽観的更新
    setProducts(prev => prev.map(p => 
      p.id === productId 
        ? { ...p, vote_count: (p.vote_count || 0) + 1, has_voted: true }
        : p
    ));
  };

  const periodLabels = {
    today: '今日',
    week: '今週',
    month: '今月'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">トレンド</h1>
              <p className="text-gray-600">話題のビジネスモデルをチェック</p>
            </div>
          </div>
        </div>

        <Tabs value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as TrendingPeriod)}>
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
            <TabsTrigger value="today" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              今日
            </TabsTrigger>
            <TabsTrigger value="week" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              今週
            </TabsTrigger>
            <TabsTrigger value="month" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              今月
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedPeriod} className="space-y-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {periodLabels[selectedPeriod]}のトレンド
              </h2>
              <p className="text-gray-600">
                {isLoading ? 'データを取得中...' : `${products.length}件のビジネスモデルが話題になっています`}
              </p>
            </div>

            {/* ローディング表示 */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            )}

            {/* トップ3の特別表示 */}
            {!isLoading && products.length >= 3 && (
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                  <Trophy className="w-6 h-6 text-yellow-600" />
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                    トップ3
                  </h3>
                  <Sparkles className="w-5 h-5 text-yellow-600" />
                </div>
                
                <div className="grid gap-8 lg:grid-cols-3">
                  {/* 1位 */}
                  <div className="lg:col-span-3">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
                      <div className="relative">
                        <ProductCard
                          product={products[0]}
                          onVote={handleVote}
                          rank={1}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* 2位と3位 */}
                  <div className="lg:col-span-3 grid gap-6 lg:grid-cols-2">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-slate-200 rounded-xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
                      <div className="relative">
                        <ProductCard
                          product={products[1]}
                          onVote={handleVote}
                          rank={2}
                        />
                      </div>
                    </div>
                    
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-200 to-amber-200 rounded-xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
                      <div className="relative">
                        <ProductCard
                          product={products[2]}
                          onVote={handleVote}
                          rank={3}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* その他のランキング */}
            {!isLoading && products.length > 3 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">その他のトレンド</h3>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {products.slice(3, 20).map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onVote={handleVote}
                      rank={index + 4}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* 3位以下のみの表示 */}
            {!isLoading && products.length > 0 && products.length <= 3 && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onVote={handleVote}
                    rank={index + 1}
                  />
                ))}
              </div>
            )}

            {!isLoading && products.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {periodLabels[selectedPeriod]}のトレンドはまだありません
                </h3>
                <p className="text-gray-600">
                  新しいビジネスモデルを投稿して、トレンドを作りましょう！
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
