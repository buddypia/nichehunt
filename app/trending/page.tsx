'use client';

import { useState, useEffect, useMemo } from 'react';
import { BusinessModelCard } from '@/components/BusinessModelCard';
import { businessModels } from '@/data/businessModels';
import { BusinessModel } from '@/types/BusinessModel';
import { TrendingUp, Clock, MessageSquare, Award, Trophy, Medal, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type TrendingPeriod = 'today' | 'week' | 'month' | 'all';

export default function TrendingPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<TrendingPeriod>('all');

  // 期間に基づいてモデルをフィルタリング
  const filteredModels = useMemo(() => {
    const now = new Date();
    let filtered = [...businessModels];

    // 期間でフィルタリング
    switch (selectedPeriod) {
      case 'today':
        filtered = filtered.filter(model => {
          const modelDate = new Date(model.createdAt);
          return modelDate.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(model => new Date(model.createdAt) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(model => new Date(model.createdAt) >= monthAgo);
        break;
    }

    // トレンドスコアで並び替え（アップボート数 + コメント数の重み付け）
    return filtered.sort((a, b) => {
      const scoreA = a.upvotes + (a.comments * 0.5);
      const scoreB = b.upvotes + (b.comments * 0.5);
      return scoreB - scoreA;
    });
  }, [selectedPeriod]);

  const periodLabels = {
    today: '今日',
    week: '今週',
    month: '今月',
    all: '全期間'
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
          <TabsList className="grid w-full max-w-md grid-cols-4 mb-8">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              全期間
            </TabsTrigger>
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
                {filteredModels.length}件のビジネスモデルが話題になっています
              </p>
            </div>

            {/* トップ3の特別表示 */}
            {filteredModels.length >= 3 && (
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
                        <BusinessModelCard
                          model={filteredModels[0]}
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
                        <BusinessModelCard
                          model={filteredModels[1]}
                          rank={2}
                        />
                      </div>
                    </div>
                    
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-200 to-amber-200 rounded-xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
                      <div className="relative">
                        <BusinessModelCard
                          model={filteredModels[2]}
                          rank={3}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* その他のランキング */}
            {filteredModels.length > 3 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">その他のトレンド</h3>
                <div className="grid gap-6">
                  {filteredModels.slice(3, 20).map((model, index) => (
                    <div key={model.id} className="relative">
                      <div className="absolute -left-12 top-4 hidden lg:block">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md">
                          {index + 4}
                        </div>
                      </div>
                      <BusinessModelCard
                        model={model}
                        rank={index + 4}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 3位以下のみの表示 */}
            {filteredModels.length > 0 && filteredModels.length <= 3 && (
              <div className="grid gap-6">
                {filteredModels.map((model, index) => (
                  <div key={model.id} className="relative">
                    <BusinessModelCard
                      model={model}
                      rank={index + 1}
                    />
                  </div>
                ))}
              </div>
            )}

            {filteredModels.length === 0 && (
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
