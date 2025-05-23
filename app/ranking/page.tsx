'use client';

import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { BusinessModelCard } from '@/components/BusinessModelCard';
import { SubmitModal } from '@/components/SubmitModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Medal, 
  Award, 
  TrendingUp, 
  Clock, 
  MessageCircle, 
  Star,
  Calendar,
  BarChart3,
  Crown
} from 'lucide-react';
import { businessModels } from '@/data/businessModels';
import { BusinessModel } from '@/types/BusinessModel';

type RankingPeriod = 'daily' | 'weekly' | 'monthly' | 'all-time';
type RankingType = 'popular' | 'newest' | 'comments' | 'featured';

export default function RankingPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<RankingPeriod>('daily');
  const [selectedType, setSelectedType] = useState<RankingType>('popular');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const periods = [
    { id: 'daily', name: '今日', icon: Calendar },
    { id: 'weekly', name: '今週', icon: BarChart3 },
    { id: 'monthly', name: '今月', icon: TrendingUp },
    { id: 'all-time', name: '全期間', icon: Crown },
  ];

  const rankingTypes = [
    { id: 'popular', name: '人気ランキング', icon: TrendingUp, description: 'アップボート数順' },
    { id: 'newest', name: '新着ランキング', icon: Clock, description: '投稿日時順' },
    { id: 'comments', name: 'コメントランキング', icon: MessageCircle, description: 'コメント数順' },
    { id: 'featured', name: '注目ランキング', icon: Star, description: '編集部おすすめ' },
  ];

  // ランキングデータを計算
  const rankedModels = useMemo(() => {
    let sorted = [...businessModels];

    // 期間フィルタリング（実際の実装では日付を考慮）
    // 今回はサンプルデータなので全て表示

    // タイプ別ソート
    switch (selectedType) {
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
  }, [selectedPeriod, selectedType]);

  // トップ3を取得
  const topThree = rankedModels.slice(0, 3);
  const restOfRanking = rankedModels.slice(3);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-8 h-8 text-yellow-500" />;
      case 2:
        return <Medal className="w-8 h-8 text-gray-400" />;
      case 3:
        return <Award className="w-8 h-8 text-orange-600" />;
      default:
        return null;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
      default:
        return 'bg-gradient-to-r from-blue-600 to-purple-600 text-white';
    }
  };

  const currentRankingType = rankingTypes.find(type => type.id === selectedType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header onSubmitClick={() => setIsSubmitModalOpen(true)} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ページヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏆 ビジネスモデルランキング
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            最も注目されているニッチなビジネスモデルをランキング形式でご紹介
          </p>
        </div>

        {/* ランキングタイプ選択 */}
        <Tabs value={selectedType} onValueChange={(value) => setSelectedType(value as RankingType)} className="mb-8">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1">
            {rankingTypes.map((type) => {
              const Icon = type.icon;
              return (
                <TabsTrigger
                  key={type.id}
                  value={type.id}
                  className="flex flex-col items-center space-y-2 p-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-center">
                    <div className="font-semibold">{type.name}</div>
                    <div className="text-xs opacity-80">{type.description}</div>
                  </div>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* 期間選択 */}
          <div className="flex justify-center mt-6">
            <div className="flex items-center space-x-2 bg-white rounded-lg p-1 shadow-sm">
              {periods.map((period) => {
                const Icon = period.icon;
                return (
                  <Button
                    key={period.id}
                    variant={selectedPeriod === period.id ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedPeriod(period.id as RankingPeriod)}
                    className={`flex items-center space-x-1 ${
                      selectedPeriod === period.id 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                        : ''
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{period.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* ランキングコンテンツ */}
          {rankingTypes.map((type) => (
            <TabsContent key={type.id} value={type.id} className="mt-8">
              {/* トップ3表彰台 */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">
                  🥇 トップ3表彰台
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                  {topThree.map((model, index) => {
                    const rank = index + 1;
                    const Icon = type.icon;
                    return (
                      <Card 
                        key={model.id} 
                        className={`relative overflow-hidden ${
                          rank === 1 ? 'md:order-2 transform md:scale-110' : 
                          rank === 2 ? 'md:order-1' : 'md:order-3'
                        } ${rank <= 3 ? 'ring-2 ring-offset-2' : ''} ${
                          rank === 1 ? 'ring-yellow-400' : 
                          rank === 2 ? 'ring-gray-400' : 
                          'ring-orange-400'
                        }`}
                      >
                        <CardHeader className="text-center pb-4">
                          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${getRankStyle(rank)} shadow-lg`}>
                            {getRankIcon(rank)}
                          </div>
                          <CardTitle className="text-lg">{model.title}</CardTitle>
                          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Icon className="w-4 h-4" />
                              <span>
                                {type.id === 'popular' ? model.upvotes :
                                 type.id === 'comments' ? model.comments :
                                 type.id === 'newest' ? model.createdAt :
                                 model.upvotes}
                              </span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <img
                            src={model.image}
                            alt={model.title}
                            className="w-full h-32 object-cover rounded-lg mb-4"
                          />
                          <p className="text-sm text-gray-600 text-center line-clamp-2">
                            {model.description}
                          </p>
                          <div className="flex justify-center mt-4">
                            <Badge className={getRankStyle(rank)}>
                              #{rank}位
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* 4位以降のランキング */}
              <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-900">
                  📊 詳細ランキング
                </h2>
                <div className="space-y-6">
                  {restOfRanking.map((model, index) => (
                    <BusinessModelCard
                      key={model.id}
                      model={model}
                      rank={index + 4}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* 統計情報 */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{businessModels.length}</div>
              <div className="text-sm text-gray-600">総ビジネスモデル数</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {businessModels.reduce((sum, model) => sum + model.upvotes, 0)}
              </div>
              <div className="text-sm text-gray-600">総アップボート数</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <MessageCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {businessModels.reduce((sum, model) => sum + model.comments, 0)}
              </div>
              <div className="text-sm text-gray-600">総コメント数</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Star className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {businessModels.filter(model => model.featured).length}
              </div>
              <div className="text-sm text-gray-600">注目ビジネスモデル数</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <SubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
      />
    </div>
  );
}
