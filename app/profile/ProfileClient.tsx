'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Calendar,
  MapPin,
  Link as LinkIcon,
  Twitter,
  Github,
  Linkedin,
  Mail,
  Edit,
  Settings,
  Trophy,
  MessageCircle,
  Users,
  Star,
  Briefcase,
  Award,
  Loader2,
  Zap,
  Heart
} from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { 
  getProfile, 
  getProfileStats, 
  getUserProducts,
  getUserUpvotedProducts,
  checkFollowStatus,
  toggleFollow,
  type Profile,
  type ProfileStats,
  type ProfileProduct,
} from '@/lib/api/profiles';
import { ProductCard } from '@/components/ProductCard';
import type { ProductWithRelations } from "@/lib/types/database";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  earned: boolean;
}

export default function ProfileClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [stats, setStats] = useState<ProfileStats>({
    totalProducts: 0,
    totalVotes: 0,
    totalComments: 0,
    followers: 0,
    following: 0
  });
  const [userProducts, setUserProducts] = useState<ProfileProduct[]>([]);
  const [upvotedProducts, setUpvotedProducts] = useState<ProfileProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      loadProfileData();
      loadCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, [userId]);

  const loadCurrentUser = async () => {
    const user = await getCurrentUser();
    setCurrentUser(user);
    if (user && user.id === userId) {
      setIsOwnProfile(true);
    } else if (user && userId) {
      // フォロー状態をチェック
      const following = await checkFollowStatus(user.id, userId);
      setIsFollowing(following);
    }
  };

  const loadProfileData = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      // プロフィール情報を取得
      const profileData = await getProfile(userId);
      if (!profileData) {
        setProfile(null);
        return;
      }
      setProfile(profileData);

      // 統計情報を取得
      const statsData = await getProfileStats(userId);
      setStats(statsData);

      // ユーザーの投稿したプロダクトを取得
      const products = await getUserProducts(userId);
      setUserProducts(products);

      // アップボートしたプロダクトを取得
      const upvoted = await getUserUpvotedProducts(userId);
      setUpvotedProducts(upvoted);

    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser) {
      router.push('/auth/signin');
      return;
    }

    if (!userId) return;

    setIsFollowLoading(true);
    try {
      const success = await toggleFollow(currentUser.id, userId);
      if (success) {
        setIsFollowing(!isFollowing);
        setStats(prev => ({
          ...prev,
          followers: isFollowing ? prev.followers - 1 : prev.followers + 1
        }));
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long'
    });
  };

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'トップコントリビューター',
      description: '10個以上のプロダクトを投稿',
      icon: Trophy,
      color: 'from-yellow-400 to-yellow-600',
      earned: stats.totalProducts >= 10
    },
    {
      id: '2',
      title: '人気クリエイター',
      description: '合計1000以上の投票を獲得',
      icon: Star,
      color: 'from-blue-400 to-blue-600',
      earned: stats.totalVotes >= 1000
    },
    {
      id: '3',
      title: 'アクティブコメンター',
      description: '50以上のコメントを投稿',
      icon: MessageCircle,
      color: 'from-purple-400 to-purple-600',
      earned: stats.totalComments >= 50
    },
    {
      id: '4',
      title: 'コミュニティリーダー',
      description: '100人以上のフォロワーを獲得',
      icon: Users,
      color: 'from-green-400 to-green-600',
      earned: stats.followers >= 100
    },
    {
      id: '5',
      title: 'アーリーアダプター',
      description: 'サービス開始初期からの参加',
      icon: Award,
      color: 'from-indigo-400 to-indigo-600',
      earned: profile ? new Date(profile.created_at) < new Date('2024-06-01') : false
    },
    {
      id: '6',
      title: 'テックイノベーター',
      description: 'テクノロジー系プロダクトを5個以上投稿',
      icon: Zap,
      color: 'from-orange-400 to-orange-600',
      earned: false // 実装が必要
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto text-blue-600" />
          <p className="mt-4 text-gray-600">プロフィールを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ユーザーIDが指定されていません</h1>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            ホームに戻る
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">プロフィールが見つかりません</h1>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            ホームに戻る
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* 戻るボタン */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          戻る
        </Button>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* プロフィールヘッダー */}
        <Card className="mb-8 overflow-hidden">
          {/* 背景グラデーション */}
          <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
          
          <CardContent className="p-8 -mt-16">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-6">
              <div className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-6 mb-4 md:mb-0">
                <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                  <AvatarImage src={profile.avatar_url} alt={profile.username} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-3xl">
                    {profile.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center md:text-left">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{profile.username}</h1>
                  {profile.bio && (
                    <p className="text-gray-600 max-w-2xl mb-3">{profile.bio}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    {profile.location && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {profile.location}
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(profile.created_at)}から参加
                    </div>
                  </div>
                  {/* スキルタグ */}
                  {profile.skills && profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {profile.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3">
                {isOwnProfile ? (
                  <>
                    <Button variant="outline" onClick={() => router.push('/settings')}>
                      <Edit className="w-4 h-4 mr-2" />
                      プロフィール編集
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => router.push('/settings')}>
                      <Settings className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={handleFollowToggle}
                      disabled={isFollowLoading}
                      className={isFollowing ? "bg-gray-200 text-gray-700 hover:bg-gray-300" : ""}
                    >
                      {isFollowLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        isFollowing ? 'フォロー中' : 'フォロー'
                      )}
                    </Button>
                    <Button variant="outline" size="icon">
                      <Mail className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* ソーシャルリンク */}
            <div className="flex items-center space-x-4 mb-6">
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <LinkIcon className="w-4 h-4 mr-1" />
                  ウェブサイト
                </a>
              )}
              {profile.twitter && (
                <a
                  href={`https://twitter.com/${profile.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Twitter className="w-4 h-4 mr-1" />
                  Twitter
                </a>
              )}
              {profile.github && (
                <a
                  href={`https://github.com/${profile.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Github className="w-4 h-4 mr-1" />
                  GitHub
                </a>
              )}
              {profile.linkedin && (
                <a
                  href={`https://linkedin.com/in/${profile.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Linkedin className="w-4 h-4 mr-1" />
                  LinkedIn
                </a>
              )}
            </div>

            {/* 統計情報 */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-3xl font-bold text-gray-900">{stats.totalProducts}</div>
                  <div className="text-sm text-gray-600">投稿</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-3xl font-bold text-gray-900">{stats.totalVotes}</div>
                  <div className="text-sm text-gray-600">獲得投票</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-3xl font-bold text-gray-900">{stats.totalComments}</div>
                  <div className="text-sm text-gray-600">コメント</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-3xl font-bold text-gray-900">{stats.followers}</div>
                  <div className="text-sm text-gray-600">フォロワー</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-3xl font-bold text-gray-900">{stats.following}</div>
                  <div className="text-sm text-gray-600">フォロー中</div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* タブコンテンツ */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">投稿したプロダクト</TabsTrigger>
            <TabsTrigger value="upvoted">アップボート</TabsTrigger>
            <TabsTrigger value="achievements">実績</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products" className="mt-6">
            <div className="space-y-6">
              {userProducts.length > 0 ? (
                userProducts.map((product: ProfileProduct) => {
                  const cardProduct: ProductWithRelations = {
                    id: product.id,
                    name: product.title,
                    tagline: product.description.substring(0, 100) + (product.description.length > 100 ? '...' : ''),
                    description: product.description,
                    product_url: null,
                    github_url: null,
                    demo_url: null,
                    thumbnail_url: product.images && product.images.length > 0 ? product.images[0] : null,
                    category_id: 0, // Placeholder category_id
                    category: product.category ? { id: 0, name: product.category, slug: product.category.toLowerCase(), description: '', icon_name: '', created_at: new Date().toISOString() } : null,
                    status: 'published',
                    launch_date: product.created_at,
                    is_featured: product.featured,
                    view_count: 0,
                    vote_count: product.votes,
                    comment_count: product.comments,
                    created_at: product.created_at,
                    updated_at: product.created_at,
                    user_id: profile.id,
                    profile: { // This maps to ProductWithRelations['profile']
                      id: profile.id,
                      username: profile.username,
                      display_name: profile.username, // Use username as display_name if not available
                      avatar_url: profile.avatar_url || null,
                      bio: profile.bio || null,
                      website_url: profile.website || null, // Use profile.website
                      twitter_handle: profile.twitter || null, // Use profile.twitter
                      created_at: profile.created_at,
                      updated_at: profile.updated_at || profile.created_at,
                    },
                    tags: product.tags ? product.tags.map((tag, index) => ({ id: index, name: tag, slug: tag.toLowerCase(), created_at: new Date().toISOString() })) : [],
                    has_voted: false,
                    is_saved: false,
                  };
                  return <ProductCard key={product.id} product={cardProduct} />;
                })
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-600">まだプロダクトを投稿していません</p>
                    {isOwnProfile && (
                      <Button className="mt-4" onClick={() => router.push('/')}>
                        最初のプロダクトを投稿する
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="upvoted" className="mt-6">
            <div className="space-y-6">
              {upvotedProducts.length > 0 ? (
                upvotedProducts.map((product: ProfileProduct) => {
                  // For upvoted products, author information is not directly available in ProfileProduct.
                  // We will use a placeholder for the author profile.
                  // Ideally, getUserUpvotedProducts would return more author details or we'd fetch them.
                  const placeholderAuthorProfile = {
                    id: 'unknown-author-id', // Placeholder ID
                    username: 'Unknown Author',
                    display_name: 'Unknown Author',
                    avatar_url: null,
                    bio: null,
                    website_url: null,
                    twitter_handle: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  };

                  const cardProduct: ProductWithRelations = {
                    id: product.id,
                    name: product.title,
                    tagline: product.description.substring(0, 100) + (product.description.length > 100 ? '...' : ''),
                    description: product.description,
                    product_url: null,
                    github_url: null,
                    demo_url: null,
                    thumbnail_url: product.images && product.images.length > 0 ? product.images[0] : null,
                    category_id: 0, // Placeholder category_id
                    category: product.category ? { id: 0, name: product.category, slug: product.category.toLowerCase(), description: '', icon_name: '', created_at: new Date().toISOString() } : null,
                    status: 'published',
                    launch_date: product.created_at,
                    is_featured: product.featured,
                    view_count: 0,
                    vote_count: product.votes,
                    comment_count: product.comments,
                    created_at: product.created_at,
                    updated_at: product.created_at,
                    user_id: 'unknown-author-id', // Placeholder user_id for the product's author
                    profile: placeholderAuthorProfile, // Use the placeholder author profile
                    tags: product.tags ? product.tags.map((tag, index) => ({ id: index, name: tag, slug: tag.toLowerCase(), created_at: new Date().toISOString() })) : [],
                    has_voted: true, // User has upvoted this product
                    is_saved: false,
                  };
                  return <ProductCard key={product.id} product={cardProduct} />;
                })
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Heart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-600">アップボートしたプロダクトはまだありません</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {achievements.map((achievement) => (
                <Card 
                  key={achievement.id}
                  className={`transition-all ${achievement.earned ? 'shadow-lg' : 'opacity-60'}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className={`w-16 h-16 bg-gradient-to-r ${achievement.color} rounded-full flex items-center justify-center ${achievement.earned ? '' : 'grayscale'}`}>
                        <achievement.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{achievement.title}</h3>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                        {achievement.earned && (
                          <Badge className="mt-2" variant="default">獲得済み</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
