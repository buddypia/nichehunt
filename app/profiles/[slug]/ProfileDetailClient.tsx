'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/components/ProductCard';
import { 
  ArrowLeft,
  Calendar,
  MapPin,
  Link as LinkIcon,
  Twitter,
  Github,
  Linkedin,
  Mail,
  Users,
  Heart,
  MessageCircle,
  Briefcase,
  Award,
  Loader2,
  UserPlus,
  Eye,
  Share2,
  TrendingUp
} from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { 
  getProfile, 
  getProfileBySlug,
  getProfileStats, 
  getUserProducts,
  getUserUpvotedProducts,
  checkFollowStatus,
  toggleFollow,
  type Profile,
  type ProfileStats,
  type ProfileProduct
} from '@/lib/api/profiles';
import { 
  getMutualFollowers,
  getSimilarInterests,
  getInteractionHistory,
  getSharedCollections,
  type MutualFollower,
  type SimilarInterest,
  type InteractionHistory,
  type SharedCollection
} from '@/lib/api/profile-relations';
import { useTypedTranslations } from '@/lib/i18n/useTranslations';
import { formatDate } from '@/lib/utils';

interface ProfileDetailClientProps {
  userSlug: string;
}

export default function ProfileDetailClient({ userSlug }: ProfileDetailClientProps) {
  const { t, language } = useTypedTranslations();
  const router = useRouter();
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
  const [mutualFollowers, setMutualFollowers] = useState<MutualFollower[]>([]);
  const [similarInterests, setSimilarInterests] = useState<SimilarInterest[]>([]);
  const [interactionHistory, setInteractionHistory] = useState<InteractionHistory | null>(null);
  const [sharedCollections, setSharedCollections] = useState<SharedCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    loadProfileData();
    loadCurrentUser();
  }, [userSlug]);

  const loadCurrentUser = async () => {
    const user = await getCurrentUser();
    setCurrentUser(user);
    if (user && profile && user.id === profile.id) {
      setIsOwnProfile(true);
    } else if (user && profile) {
      // フォロー状態をチェック
      const following = await checkFollowStatus(user.id, profile.id);
      setIsFollowing(following);
      // 関連情報を取得
      loadRelatedContent(user.id);
    }
  };

  const loadProfileData = async () => {
    setIsLoading(true);
    try {
      // プロフィール情報を取得
      const profileData = await getProfileBySlug(userSlug);
      if (!profileData) {
        setProfile(null);
        return;
      }
      setProfile(profileData);

      // 統計情報を取得
      const statsData = await getProfileStats(profileData.id);
      setStats(statsData);

      // ユーザーの投稿したプロダクトを取得
      const products = await getUserProducts(profileData.id);
      setUserProducts(products);

      // アップボートしたプロダクトを取得
      const upvoted = await getUserUpvotedProducts(profileData.id);
      setUpvotedProducts(upvoted);

    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRelatedContent = async (currentUserId: string) => {
    if (!profile) return;
    
    try {
      // 共通のフォロワーを取得
      const mutual = await getMutualFollowers(currentUserId, profile.id);
      setMutualFollowers(mutual);

      // 似た興味を持つカテゴリを取得
      const interests = await getSimilarInterests(currentUserId, profile.id);
      setSimilarInterests(interests);

      // インタラクション履歴を取得
      const history = await getInteractionHistory(currentUserId, profile.id);
      setInteractionHistory(history);

      // 共有コレクションを取得
      const collections = await getSharedCollections(currentUserId, profile.id);
      setSharedCollections(collections);
    } catch (error) {
      console.error('Error loading related content:', error);
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser || !profile) {
      router.push('/auth/signin');
      return;
    }

    setIsFollowLoading(true);
    try {
      const success = await toggleFollow(currentUser.id, profile.id);
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


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <Skeleton className="h-32 w-full mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Skeleton className="h-96" />
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t.profile.profileNotFound}</h1>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.profile.backHome}
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
          {t.profile.back}
        </Button>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 左サイドバー - プロフィール情報 */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage src={profile.avatar_url} alt={profile.username} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-2xl">
                      {profile.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{profile.username}</h1>
                  {profile.bio && (
                    <p className="text-gray-600 text-sm mb-4">{profile.bio}</p>
                  )}
                  
                  {!isOwnProfile && (
                    <Button
                      onClick={handleFollowToggle}
                      disabled={isFollowLoading}
                      className="w-full mb-4"
                      variant={isFollowing ? "outline" : "default"}
                    >
                      {isFollowLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isFollowing ? (
                        <>{t.profile.following}</>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          {t.profile.follow}
                        </>
                      )}
                    </Button>
                  )}

                  <div className="flex flex-col space-y-2 text-sm text-gray-500">
                    {profile.location && (
                      <div className="flex items-center justify-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {profile.location}
                      </div>
                    )}
                    <div className="flex items-center justify-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {t.profile.joinedSince.replace('{date}', formatDate(profile.created_at, language, { year: 'numeric', month: 'long' }))}
                    </div>
                  </div>
                </div>

                {/* ソーシャルリンク */}
                <div className="mt-6 space-y-2">
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <LinkIcon className="w-4 h-4 mr-2" />
                      {t.profile.website}
                    </a>
                  )}
                  {profile.twitter && (
                    <a
                      href={`https://twitter.com/${profile.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <Twitter className="w-4 h-4 mr-2" />
                      {t.profile.twitter}
                    </a>
                  )}
                  {profile.github && (
                    <a
                      href={`https://github.com/${profile.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <Github className="w-4 h-4 mr-2" />
                      {t.profile.github}
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 統計情報 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t.profile.statistics}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t.profile.stats.posts}</span>
                  <span className="font-semibold">{stats.totalProducts}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t.profile.stats.votes}</span>
                  <span className="font-semibold">{stats.totalVotes}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t.profile.stats.comments}</span>
                  <span className="font-semibold">{stats.totalComments}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t.profile.stats.followers}</span>
                  <span className="font-semibold">{stats.followers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t.profile.stats.following}</span>
                  <span className="font-semibold">{stats.following}</span>
                </div>
              </CardContent>
            </Card>

            {/* 関連情報 - ログインユーザーとの関係 */}
            {currentUser && !isOwnProfile && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t.profile.relationshipWithYou}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 共通のフォロワー */}
                  {mutualFollowers.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        <Users className="w-4 h-4 inline mr-1" />
                        {t.profile.mutualFollowers.replace('{count}', mutualFollowers.length.toString())}
                      </h4>
                      <div className="flex -space-x-2">
                        {mutualFollowers.slice(0, 5).map((follower) => (
                          <Avatar
                            key={follower.id}
                            className="w-8 h-8 border-2 border-white cursor-pointer"
                            onClick={() => router.push(`/profiles/${follower.username}`)}
                          >
                            <AvatarImage src={follower.avatar_url} alt={follower.username} />
                            <AvatarFallback className="text-xs">
                              {follower.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {mutualFollowers.length > 5 && (
                          <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-600">
                            +{mutualFollowers.length - 5}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 似た興味 */}
                  {similarInterests.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        <Heart className="w-4 h-4 inline mr-1" />
                        {t.profile.mutualInterests}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {similarInterests.map((interest) => (
                          <Badge key={interest.category} variant="secondary" className="text-xs">
                            {interest.category} ({interest.sharedCount})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* インタラクション履歴 */}
                  {interactionHistory && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        <MessageCircle className="w-4 h-4 inline mr-1" />
                        {t.profile.interactions}
                      </h4>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div>{t.profile.mutualVotes}: {interactionHistory.mutualVotes}回</div>
                        <div>{t.profile.mutualComments}: {interactionHistory.mutualComments}回</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* メインコンテンツ */}
          <div className="md:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="products">
                  <Briefcase className="w-4 h-4 mr-2" />
                  {t.profile.tabs.products}
                </TabsTrigger>
                <TabsTrigger value="upvoted">
                  <Heart className="w-4 h-4 mr-2" />
                  {t.profile.tabs.upvoted}
                </TabsTrigger>
                <TabsTrigger value="activity">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  {t.profile.tabs.activity}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="products" className="mt-6">
                <div className="space-y-4">
                  {userProducts.length > 0 ? (
                    userProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={{
                          id: product.id,
                          user_id: profile.id,
                          name: product.title,
                          tagline: product.description.substring(0, 100),
                          description: product.description,
                          product_url: null,
                          github_url: null,
                          demo_url: null,
                          thumbnail_url: product.images[0] || null,
                          category_id: null,
                          status: 'published' as const,
                          launch_date: product.created_at,
                          is_featured: product.featured,
                          view_count: 0,
                          created_at: product.created_at,
                          updated_at: product.created_at,
                          vote_count: product.votes,
                          comment_count: product.comments,
                          profile: {
                            id: profile.id,
                            username: profile.username,
                            display_name: profile.username,
                            bio: profile.bio,
                            avatar_url: profile.avatar_url,
                            website_url: profile.website,
                            twitter_handle: profile.twitter,
                            slug: profile.slug,
                            created_at: profile.created_at,
                            updated_at: profile.created_at
                          },
                          category: product.category ? {
                            id: 1,
                            name: product.category,
                            slug: product.category.toLowerCase().replace(/\s+/g, '-'),
                            description: null,
                            icon_name: null,
                            created_at: product.created_at
                          } : undefined,
                          tags: product.tags.map((tag, index) => ({
                            id: index + 1,
                            name: tag,
                            slug: tag.toLowerCase().replace(/\s+/g, '-'),
                            created_at: product.created_at
                          })),
                          images: product.images.map((image, index) => ({
                            id: index + 1,
                            product_id: product.id,
                            image_url: image,
                            caption: null as string | null,
                            display_order: index,
                            created_at: product.created_at
                          })),
                          is_saved: false,
                          locale: 'ja',
                          has_voted: false
                        }}
                      />
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-600">{t.profile.emptyStates.noProducts}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="upvoted" className="mt-6">
                <div className="space-y-4">
                  {upvotedProducts.length > 0 ? (
                    upvotedProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={{
                          id: product.id,
                          user_id: '',
                          name: product.title,
                          tagline: product.description.substring(0, 100),
                          description: product.description,
                          product_url: null,
                          github_url: null,
                          demo_url: null,
                          thumbnail_url: product.images[0] || null,
                          category_id: null,
                          status: 'published' as const,
                          launch_date: product.created_at,
                          is_featured: product.featured,
                          view_count: 0,
                          created_at: product.created_at,
                          updated_at: product.created_at,
                          vote_count: product.votes,
                          comment_count: product.comments,
                          profile: undefined,
                          category: product.category ? {
                            id: 1,
                            name: product.category,
                            slug: product.category.toLowerCase().replace(/\s+/g, '-'),
                            description: null,
                            icon_name: null,
                            created_at: product.created_at
                          } : undefined,
                          tags: product.tags.map((tag, index) => ({
                            id: index + 1,
                            name: tag,
                            slug: tag.toLowerCase().replace(/\s+/g, '-'),
                            created_at: product.created_at
                          })),
                          images: product.images.map((image, index) => ({
                            id: index + 1,
                            product_id: product.id,
                            image_url: image,
                            caption: null as string | null,
                            display_order: index,
                            created_at: product.created_at
                          })),
                          is_saved: false,
                          locale: 'ja',
                          has_voted: true
                        }}
                      />
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Heart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-600">{t.profile.emptyStates.noUpvoted}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="activity" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t.profile.recentActivity}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* アクティビティタイムライン */}
                      <div className="text-center text-gray-500 py-8">
                        {t.profile.activityComingSoon}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
