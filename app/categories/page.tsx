'use client';

import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { SubmitModal } from '@/components/SubmitModal';
import { BusinessModelCard } from '@/components/BusinessModelCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  ChevronRight,
  TrendingUp,
  Clock,
  Star,
  MessageCircle,
  Users,
  Zap,
  Target,
  Lightbulb,
  Briefcase,
  Globe,
  Smartphone,
  Heart,
  Leaf,
  GraduationCap,
  Home,
  ShoppingCart,
  Gamepad2,
  Music,
  Camera,
  Utensils,
  Car,
  Plane,
  Dumbbell,
  Palette,
  Code,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BusinessModel {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  upvotes: number;
  comments: number;
  author: string;
  createdAt: string;
  featured: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedRevenue: string;
  timeToMarket: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: any;
  count: number;
  trending: boolean;
  color: string;
}

const categories: Category[] = [
  {
    id: 'saas',
    name: 'SaaS・ソフトウェア',
    description: 'クラウドベースのソフトウェアサービス',
    icon: Code,
    count: 156,
    trending: true,
    color: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  {
    id: 'ecommerce',
    name: 'Eコマース・マーケットプレイス',
    description: 'オンライン販売・取引プラットフォーム',
    icon: ShoppingCart,
    count: 134,
    trending: true,
    color: 'bg-green-100 text-green-700 border-green-200'
  },
  {
    id: 'subscription',
    name: 'サブスクリプション',
    description: '継続課金型ビジネスモデル',
    icon: Target,
    count: 98,
    trending: false,
    color: 'bg-purple-100 text-purple-700 border-purple-200'
  },
  {
    id: 'education',
    name: '教育・学習',
    description: 'オンライン教育・スキル習得サービス',
    icon: GraduationCap,
    count: 87,
    trending: true,
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200'
  },
  {
    id: 'health',
    name: 'ヘルス・ウェルネス',
    description: '健康・美容・フィットネス関連',
    icon: Heart,
    count: 76,
    trending: false,
    color: 'bg-red-100 text-red-700 border-red-200'
  },
  {
    id: 'sustainability',
    name: 'サステナビリティ',
    description: '環境・社会課題解決型ビジネス',
    icon: Leaf,
    count: 65,
    trending: true,
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200'
  },
  {
    id: 'fintech',
    name: 'フィンテック',
    description: '金融・決済・投資サービス',
    icon: Briefcase,
    count: 54,
    trending: false,
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200'
  },
  {
    id: 'entertainment',
    name: 'エンターテイメント',
    description: 'ゲーム・音楽・動画コンテンツ',
    icon: Gamepad2,
    count: 43,
    trending: false,
    color: 'bg-pink-100 text-pink-700 border-pink-200'
  },
  {
    id: 'food',
    name: 'フード・飲食',
    description: '食品・レストラン・デリバリー',
    icon: Utensils,
    count: 38,
    trending: false,
    color: 'bg-orange-100 text-orange-700 border-orange-200'
  },
  {
    id: 'travel',
    name: '旅行・観光',
    description: '旅行予約・観光・宿泊サービス',
    icon: Plane,
    count: 32,
    trending: false,
    color: 'bg-cyan-100 text-cyan-700 border-cyan-200'
  },
  {
    id: 'real-estate',
    name: '不動産・住宅',
    description: '不動産売買・賃貸・管理サービス',
    icon: Home,
    count: 29,
    trending: false,
    color: 'bg-slate-100 text-slate-700 border-slate-200'
  },
  {
    id: 'automotive',
    name: '自動車・モビリティ',
    description: 'カーシェア・配車・自動車関連',
    icon: Car,
    count: 25,
    trending: false,
    color: 'bg-gray-100 text-gray-700 border-gray-200'
  }
];

const businessModels: BusinessModel[] = [
  {
    id: '1',
    title: 'ニッチ業界向けCRMツール',
    description: '特定業界に特化したカスタマイズ可能なCRMシステム。既存の汎用CRMでは対応できない業界特有のニーズに対応。',
    category: 'saas',
    tags: ['SaaS', 'CRM', 'B2B'],
    upvotes: 234,
    comments: 45,
    author: '田中太郎',
    createdAt: '2024-01-15',
    featured: true,
    difficulty: 'intermediate',
    estimatedRevenue: '月額50-200万円',
    timeToMarket: '6-12ヶ月'
  },
  {
    id: '2',
    title: 'ペット用品のサブスクボックス',
    description: 'ペットの種類・年齢・健康状態に合わせてカスタマイズされた用品を毎月お届けするサービス。',
    category: 'subscription',
    tags: ['サブスク', 'ペット', 'EC'],
    upvotes: 189,
    comments: 32,
    author: '佐藤花子',
    createdAt: '2024-01-14',
    featured: false,
    difficulty: 'beginner',
    estimatedRevenue: '月額30-100万円',
    timeToMarket: '3-6ヶ月'
  },
  {
    id: '3',
    title: 'オンライン専門スキル学習プラットフォーム',
    description: '特定の専門分野（例：和菓子作り、伝統工芸）に特化したオンライン学習サービス。',
    category: 'education',
    tags: ['EdTech', 'オンライン学習', '専門スキル'],
    upvotes: 156,
    comments: 28,
    author: '山田次郎',
    createdAt: '2024-01-13',
    featured: true,
    difficulty: 'advanced',
    estimatedRevenue: '月額20-80万円',
    timeToMarket: '8-15ヶ月'
  }
];

type ViewMode = 'grid' | 'list';
type SortOption = 'popular' | 'newest' | 'comments' | 'trending';

export default function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    return categories.filter(category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const filteredBusinessModels = useMemo(() => {
    let filtered = businessModels;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(model => model.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(model =>
        model.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // ソート
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.upvotes - a.upvotes);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'comments':
        filtered.sort((a, b) => b.comments - a.comments);
        break;
      case 'trending':
        filtered.sort((a, b) => (b.upvotes + b.comments) - (a.upvotes + a.comments));
        break;
    }

    return filtered;
  }, [selectedCategory, searchQuery, sortBy]);

  const sortOptions = [
    { id: 'popular', name: '人気順', icon: TrendingUp },
    { id: 'newest', name: '新着順', icon: Clock },
    { id: 'comments', name: 'コメント順', icon: MessageCircle },
    { id: 'trending', name: 'トレンド', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header onSubmitClick={() => setIsSubmitModalOpen(true)} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ページヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📂 カテゴリー
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            業界・分野別にニッチビジネスモデルを探索しましょう
          </p>
        </div>

        {/* パンくずナビ */}
        {selectedCategory !== 'all' && (
          <div className="flex items-center space-x-2 mb-6 text-sm text-gray-600">
            <button
              onClick={() => setSelectedCategory('all')}
              className="hover:text-blue-600 transition-colors"
            >
              すべてのカテゴリー
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">
              {categories.find(c => c.id === selectedCategory)?.name}
            </span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* サイドバー */}
          <aside className="lg:w-80">
            <div className="sticky top-24 space-y-6">
              {/* 検索 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Search className="w-5 h-5" />
                    <span>検索</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="カテゴリーやビジネスモデルを検索..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* カテゴリー一覧 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Filter className="w-5 h-5" />
                    <span>カテゴリー</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors",
                      selectedCategory === 'all'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'hover:bg-gray-100'
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <Globe className="w-5 h-5" />
                      <span className="font-medium">すべて</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {businessModels.length}
                    </span>
                  </button>
                  
                  {filteredCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors",
                          selectedCategory === category.id
                            ? category.color
                            : 'hover:bg-gray-100'
                        )}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5" />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{category.name}</span>
                              {category.trending && (
                                <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                                  🔥 トレンド
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {category.description}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {category.count}
                        </span>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>

              {/* 統計情報 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>統計情報</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">総ビジネスモデル数</span>
                    <span className="font-bold text-gray-900">{businessModels.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">カテゴリー数</span>
                    <span className="font-bold text-gray-900">{categories.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">今週の新着</span>
                    <span className="font-bold text-gray-900">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">トレンドカテゴリー</span>
                    <span className="font-bold text-gray-900">
                      {categories.filter(c => c.trending).length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* メインコンテンツ */}
          <div className="flex-1">
            {selectedCategory === 'all' ? (
              /* カテゴリー概要表示 */
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    すべてのカテゴリー
                  </h2>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className={cn(
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                    : 'space-y-4'
                )}>
                  {filteredCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <Card 
                        key={category.id} 
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={cn("p-2 rounded-lg", category.color)}>
                                <Icon className="w-6 h-6" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{category.name}</CardTitle>
                                {category.trending && (
                                  <Badge variant="secondary" className="mt-1 bg-orange-100 text-orange-700">
                                    🔥 トレンド
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <span className="text-2xl font-bold text-gray-900">
                              {category.count}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600 mb-4">{category.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                              {category.count} ビジネスモデル
                            </span>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* 選択されたカテゴリーのビジネスモデル表示 */
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {categories.find(c => c.id === selectedCategory)?.name}
                    </h2>
                    <p className="text-gray-600">
                      {categories.find(c => c.id === selectedCategory)?.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* ソートオプション */}
                    <div className="flex items-center space-x-2">
                      {sortOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <Button
                            key={option.id}
                            variant={sortBy === option.id ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSortBy(option.id as SortOption)}
                            className="flex items-center space-x-1"
                          >
                            <Icon className="w-4 h-4" />
                            <span>{option.name}</span>
                          </Button>
                        );
                      })}
                    </div>
                    
                    {/* 表示切り替え */}
                    <div className="flex items-center space-x-1 border rounded-lg p-1">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                      >
                        <Grid3X3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* ビジネスモデル一覧 */}
                {filteredBusinessModels.length > 0 ? (
                  <div className={cn(
                    viewMode === 'grid' 
                      ? 'grid grid-cols-1 lg:grid-cols-2 gap-6'
                      : 'space-y-4'
                  )}>
                    {filteredBusinessModels.map((model) => (
                      <BusinessModelCard
                        key={model.id}
                        businessModel={model}
                        compact={viewMode === 'list'}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📂</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      該当するビジネスモデルが見つかりません
                    </h3>
                    <p className="text-gray-600 mb-4">
                      検索条件を変更するか、他のカテゴリーをお試しください
                    </p>
                    <Button
                      onClick={() => {
                        setSelectedCategory('all');
                        setSearchQuery('');
                      }}
                      variant="outline"
                    >
                      すべてのカテゴリーを表示
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <SubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
      />
    </div>
  );
}
