'use client';

import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/Header';
import { BusinessModelCard } from '@/components/BusinessModelCard';
import { SubmitModal } from '@/components/SubmitModal';
import { businessModels } from '@/data/businessModels';
import { BusinessModel } from '@/types/BusinessModel';
import { TrendingUp, Clock, MessageSquare, Award } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type TrendingPeriod = 'today' | 'week' | 'month' | 'all';

export default function TrendingPage() {
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<TrendingPeriod>('week');

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
      <Header onSubmitClick={() => setIsSubmitModalOpen(true)} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
            <TabsTrigger value="all" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              全期間
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

            <div className="grid gap-6">
              {filteredModels.slice(0, 20).map((model, index) => (
                <div key={model.id} className="relative">
                  {index < 3 && (
                    <div className="absolute -left-12 top-4 hidden lg:block">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                        index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                        'bg-gradient-to-r from-orange-600 to-orange-700'
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                  )}
                  <BusinessModelCard
                    model={model}
                    rank={index + 1}
                  />
                </div>
              ))}
            </div>

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

      <SubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
      />
    </div>
  );
}
