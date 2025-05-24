'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  MessageCircle, 
  TrendingUp, 
  Clock, 
  Star,
  ThumbsUp,
  Eye,
  Calendar,
  Award,
  Bookmark,
  Share2,
  MoreHorizontal,
  Filter,
  Search,
  Plus,
  Heart,
  Reply,
  Flag,
  BookOpen,
  Flame
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    verified: boolean;
    role: string;
  };
  createdAt: string;
  category: string;
  tags: string[];
  upvotes: number;
  comments: number;
  views: number;
  featured: boolean;
  type: 'discussion' | 'question' | 'showcase' | 'feedback';
}

interface CommunityMember {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
  role: string;
  contributions: number;
  joinedAt: string;
  badges: string[];
}

const communityPosts: CommunityPost[] = [
  {
    id: '1',
    title: 'サブスクリプションモデルの収益最適化について',
    content: 'SaaSビジネスでMRRを向上させるための具体的な戦略について議論しませんか？特にチャーン率の改善とアップセルの効果的な手法について...',
    author: {
      name: '田中 健太',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      verified: true,
      role: 'SaaS起業家'
    },
    createdAt: '2024-01-15T10:30:00Z',
    category: 'サブスクリプション',
    tags: ['SaaS', 'MRR', 'チャーン率'],
    upvotes: 42,
    comments: 18,
    views: 234,
    featured: true,
    type: 'discussion'
  },
  {
    id: '2',
    title: 'AIを活用したニッチ市場の発見方法',
    content: '機械学習を使って未開拓の市場機会を特定する手法について質問があります。どのようなデータソースとアルゴリズムが効果的でしょうか？',
    author: {
      name: '佐藤 美咲',
      avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      verified: false,
      role: 'データサイエンティスト'
    },
    createdAt: '2024-01-15T08:15:00Z',
    category: 'AI・テクノロジー',
    tags: ['AI', '市場分析', 'データサイエンス'],
    upvotes: 28,
    comments: 12,
    views: 156,
    featured: false,
    type: 'question'
  },
  {
    id: '3',
    title: '月収100万円達成！ニッチECサイトの成功事例',
    content: '特殊な趣味用品のECサイトを運営して、開始から8ヶ月で月収100万円を達成しました。具体的な戦略と学んだことをシェアします...',
    author: {
      name: '山田 太郎',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      verified: true,
      role: 'EC起業家'
    },
    createdAt: '2024-01-14T16:45:00Z',
    category: 'マーケットプレイス',
    tags: ['EC', '成功事例', 'ニッチ市場'],
    upvotes: 89,
    comments: 34,
    views: 567,
    featured: true,
    type: 'showcase'
  },
  {
    id: '4',
    title: 'オンライン教育プラットフォームのフィードバック募集',
    content: 'プログラミング学習に特化したプラットフォームを開発中です。β版のフィードバックをいただけませんか？特にUXとコンテンツ構成について...',
    author: {
      name: '鈴木 花子',
      avatar: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      verified: false,
      role: 'EdTech開発者'
    },
    createdAt: '2024-01-14T12:20:00Z',
    category: '教育・学習',
    tags: ['EdTech', 'フィードバック', 'β版'],
    upvotes: 15,
    comments: 8,
    views: 98,
    featured: false,
    type: 'feedback'
  },
  {
    id: '5',
    title: 'サステナブルビジネスの収益化戦略',
    content: '環境に配慮したビジネスモデルで持続可能な収益を上げる方法について議論しましょう。ESG投資の観点からも注目されている分野です...',
    author: {
      name: '高橋 誠',
      avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      verified: true,
      role: 'サステナビリティコンサルタント'
    },
    createdAt: '2024-01-13T14:30:00Z',
    category: 'サステナビリティ',
    tags: ['ESG', '環境', '持続可能性'],
    upvotes: 31,
    comments: 16,
    views: 203,
    featured: false,
    type: 'discussion'
  }
];

const topMembers: CommunityMember[] = [
  {
    id: '1',
    name: '田中 健太',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    verified: true,
    role: 'SaaS起業家',
    contributions: 156,
    joinedAt: '2023-08-15',
    badges: ['トップコントリビューター', 'SaaS専門家']
  },
  {
    id: '2',
    name: '山田 太郎',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    verified: true,
    role: 'EC起業家',
    contributions: 134,
    joinedAt: '2023-09-20',
    badges: ['成功事例シェア王', 'EC専門家']
  },
  {
    id: '3',
    name: '高橋 誠',
    avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    verified: true,
    role: 'サステナビリティコンサルタント',
    contributions: 98,
    joinedAt: '2023-10-05',
    badges: ['サステナビリティ専門家', 'アドバイザー']
  }
];

type PostFilter = 'all' | 'discussion' | 'question' | 'showcase' | 'feedback';
type PostSort = 'newest' | 'popular' | 'trending' | 'most-commented';

export default function CommunityPage() {
  const [selectedFilter, setSelectedFilter] = useState<PostFilter>('all');
  const [selectedSort, setSelectedSort] = useState<PostSort>('newest');
  const [searchQuery, setSearchQuery] = useState('');

  const postTypes = [
    { id: 'all', name: 'すべて', icon: Users, color: 'bg-gray-100 text-gray-700' },
    { id: 'discussion', name: '議論', icon: MessageCircle, color: 'bg-blue-100 text-blue-700' },
    { id: 'question', name: '質問', icon: Star, color: 'bg-yellow-100 text-yellow-700' },
    { id: 'showcase', name: '事例紹介', icon: Award, color: 'bg-green-100 text-green-700' },
    { id: 'feedback', name: 'フィードバック', icon: Heart, color: 'bg-pink-100 text-pink-700' },
  ];

  const sortOptions = [
    { id: 'newest', name: '新着順', icon: Clock },
    { id: 'popular', name: '人気順', icon: TrendingUp },
    { id: 'trending', name: 'トレンド', icon: Flame },
    { id: 'most-commented', name: 'コメント順', icon: MessageCircle },
  ];

  const filteredAndSortedPosts = useMemo(() => {
    let filtered = communityPosts;

    // フィルタリング
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(post => post.type === selectedFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // ソート
    switch (selectedSort) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => b.upvotes - a.upvotes);
        break;
      case 'trending':
        filtered.sort((a, b) => (b.upvotes + b.views) - (a.upvotes + a.views));
        break;
      case 'most-commented':
        filtered.sort((a, b) => b.comments - a.comments);
        break;
    }

    return filtered;
  }, [selectedFilter, selectedSort, searchQuery]);

  const getPostTypeIcon = (type: string) => {
    const postType = postTypes.find(t => t.id === type);
    if (!postType) return MessageCircle;
    return postType.icon;
  };

  const getPostTypeColor = (type: string) => {
    const postType = postTypes.find(t => t.id === type);
    return postType?.color || 'bg-gray-100 text-gray-700';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return '1時間未満前';
    if (diffInHours < 24) return `${diffInHours}時間前`;
    return `${Math.floor(diffInHours / 24)}日前`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ページヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            👥 コミュニティ
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            ニッチビジネスの起業家たちと知識を共有し、共に成長しましょう
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* メインコンテンツ */}
          <div className="flex-1">
            {/* フィルターとソート */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-500" />
                  <span className="font-medium text-gray-900">フィルター & ソート</span>
                </div>
              </div>

              {/* 検索バー */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="投稿を検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 投稿タイプフィルター */}
              <div className="flex flex-wrap gap-2 mb-4">
                {postTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Button
                      key={type.id}
                      variant={selectedFilter === type.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedFilter(type.id as PostFilter)}
                      className={cn(
                        "flex items-center space-x-2",
                        selectedFilter === type.id 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                          : ''
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{type.name}</span>
                    </Button>
                  );
                })}
              </div>

              {/* ソートオプション */}
              <div className="flex flex-wrap gap-2">
                {sortOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Button
                      key={option.id}
                      variant={selectedSort === option.id ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setSelectedSort(option.id as PostSort)}
                      className={cn(
                        "flex items-center space-x-1",
                        selectedSort === option.id 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                          : ''
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{option.name}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* 投稿一覧 */}
            <div className="space-y-6">
              {filteredAndSortedPosts.map((post) => {
                const PostIcon = getPostTypeIcon(post.type);
                return (
                  <Card key={post.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={post.author.avatar} alt={post.author.name} />
                            <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-gray-900">{post.author.name}</span>
                              {post.author.verified && (
                                <Badge variant="secondary" className="text-xs">
                                  ✓ 認証済み
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span>{post.author.role}</span>
                              <span>•</span>
                              <span>{formatTimeAgo(post.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {post.featured && (
                            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                              <Star className="w-3 h-3 mr-1" />
                              注目
                            </Badge>
                          )}
                          <Badge className={getPostTypeColor(post.type)}>
                            <PostIcon className="w-3 h-3 mr-1" />
                            {postTypes.find(t => t.id === post.type)?.name}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 cursor-pointer">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {post.content}
                      </p>
                      
                      {/* タグ */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>

                      {/* アクション */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-gray-600 hover:text-blue-600">
                            <ThumbsUp className="w-4 h-4" />
                            <span>{post.upvotes}</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-gray-600 hover:text-green-600">
                            <MessageCircle className="w-4 h-4" />
                            <span>{post.comments}</span>
                          </Button>
                          <div className="flex items-center space-x-1 text-gray-500 text-sm">
                            <Eye className="w-4 h-4" />
                            <span>{post.views}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Bookmark className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Share2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredAndSortedPosts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">💬</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  該当する投稿が見つかりません
                </h3>
                <p className="text-gray-600">
                  検索条件を変更するか、新しい投稿を作成してみてください
                </p>
              </div>
            )}
          </div>

          {/* サイドバー */}
          <aside className="lg:w-80">
            <div className="sticky top-24 space-y-6">
              {/* コミュニティ統計 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>コミュニティ統計</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">総メンバー数</span>
                    <span className="font-bold text-gray-900">2,847</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">今日の投稿</span>
                    <span className="font-bold text-gray-900">23</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">今週のアクティブユーザー</span>
                    <span className="font-bold text-gray-900">1,234</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">総投稿数</span>
                    <span className="font-bold text-gray-900">15,678</span>
                  </div>
                </CardContent>
              </Card>

              {/* トップコントリビューター */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="w-5 h-5" />
                    <span>トップコントリビューター</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topMembers.map((member, index) => (
                    <div key={member.id} className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-gray-500">#{index + 1}</span>
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>{member.name[0]}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-1">
                          <span className="font-medium text-gray-900 text-sm">{member.name}</span>
                          {member.verified && (
                            <Badge variant="secondary" className="text-xs">✓</Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{member.contributions} 貢献</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* コミュニティガイドライン */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5" />
                    <span>コミュニティガイドライン</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>建設的で敬意のあるコミュニケーション</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>具体的で価値のある情報の共有</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>他のメンバーの成功を応援</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-red-500">✗</span>
                    <span>スパムや宣伝目的の投稿</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-red-500">✗</span>
                    <span>攻撃的または差別的な言動</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
