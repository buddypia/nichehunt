'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BusinessModelCard } from '@/components/BusinessModelCard';
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
  TrendingUp,
  MessageCircle,
  Users,
  Star,
  Briefcase,
  Award
} from 'lucide-react';
import { SubmitModal } from '@/components/SubmitModal';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { BusinessModel } from '@/types/BusinessModel';

interface ProfileDetailClientProps {
  userId: string;
}

interface Profile {
  id: string;
  username: string;
  bio?: string;
  avatar_url?: string;
  location?: string;
  website?: string;
  twitter?: string;
  github?: string;
  linkedin?: string;
  created_at: string;
}

interface ProfileStats {
  totalModels: number;
  totalUpvotes: number;
  totalComments: number;
  followers: number;
  following: number;
}

export default function ProfileDetailClient({ userId }: ProfileDetailClientProps) {
  const router = useRouter();
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [stats, setStats] = useState<ProfileStats>({
    totalModels: 0,
    totalUpvotes: 0,
    totalComments: 0,
    followers: 0,
    following: 0
  });
  const [userModels, setUserModels] = useState<BusinessModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfileData();
    loadCurrentUser();
  }, [userId]);

  const loadCurrentUser = async () => {
    const user = await getCurrentUser();
    setCurrentUser(user);
    if (user && user.id === userId) {
      setIsOwnProfile(true);
    }
  };

  const loadProfileData = async () => {
    setIsLoading(true);
    try {
      // プロフィール情報を取得
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // ユーザーの投稿したビジネスモデルを取得（仮のデータ）
      const mockModels: BusinessModel[] = [
        {
          id: '1',
          title: 'AIメンタルヘルスコーチ',
          description: '日々の気分や行動をトラッキングし、AIがパーソナライズされたメンタルヘルスアドバイスを提供。',
          category: 'ヘルスケア',
          tags: ['AI', 'メンタルヘルス', 'ウェルビーイング', 'ヘルステック'],
          upvotes: 523,
          comments: 89,
          author: {
            name: profileData.username,
            avatar: profileData.avatar_url || '',
            verified: true
          },
          createdAt: '2024-01-22',
          featured: true,
          revenue: '月額1,500円/ユーザー',
          difficulty: 'Medium',
          timeToMarket: '3-6ヶ月',
          initialInvestment: '500万円〜',
          targetMarket: 'ストレスを抱える20-40代のビジネスパーソン',
          image: 'https://images.pexels.com/photos/4101143/pexels-photo-4101143.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          userCount: 15000
        },
        {
          id: '2',
          title: '高齢者向けVR旅行体験サービス',
          description: '移動が困難な高齢者向けに、VRで世界中の観光地を体験できるサービス。',
          category: 'エンターテインメント',
          tags: ['VR', '高齢者', '旅行', 'ウェルビーイング'],
          upvotes: 412,
          comments: 67,
          author: {
            name: profileData.username,
            avatar: profileData.avatar_url || '',
            verified: true
          },
          createdAt: '2024-01-20',
          featured: false,
          revenue: '月額3,000円/施設',
          difficulty: 'Hard',
          timeToMarket: '6-12ヶ月',
          initialInvestment: '1000万円〜',
          targetMarket: '介護施設、高齢者向け住宅',
          image: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          userCount: 8000
        }
      ];

      setUserModels(mockModels);

      // 統計情報を計算
      setStats({
        totalModels: mockModels.length,
        totalUpvotes: mockModels.reduce((sum, model) => sum + model.upvotes, 0),
        totalComments: mockModels.reduce((sum, model) => sum + model.comments, 0),
        followers: 1234,
        following: 567
      });

    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    setStats(prev => ({
      ...prev,
      followers: isFollowing ? prev.followers - 1 : prev.followers + 1
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header onSubmitClick={() => setIsSubmitModalOpen(true)} />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">プロフィールを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header onSubmitClick={() => setIsSubmitModalOpen(true)} />
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
      <Header onSubmitClick={() => setIsSubmitModalOpen(true)} />
      
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
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
              <div className="flex items-center space-x-6 mb-4 md:mb-0">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile.avatar_url} alt={profile.username} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-2xl">
                    {profile.username.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{profile.username}</h1>
                  {profile.bio && (
                    <p className="text-gray-600 max-w-2xl">{profile.bio}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
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
                </div>
              </div>

              <div className="flex space-x-3">
                {isOwnProfile ? (
                  <>
                    <Button variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      プロフィール編集
                    </Button>
                    <Button variant="outline" size="icon">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={handleFollowToggle}
                      className={isFollowing ? "bg-gray-200 text-gray-700 hover:bg-gray-300" : ""}
                    >
                      {isFollowing ? 'フォロー中' : 'フォロー'}
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
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{stats.totalModels}</div>
                <div className="text-sm text-gray-600">投稿</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{stats.totalUpvotes}</div>
                <div className="text-sm text-gray-600">獲得投票</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{stats.totalComments}</div>
                <div className="text-sm text-gray-600">コメント</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{stats.followers}</div>
                <div className="text-sm text-gray-600">フォロワー</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{stats.following}</div>
                <div className="text-sm text-gray-600">フォロー中</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* タブコンテンツ */}
        <Tabs defaultValue="models" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="models">投稿したモデル</TabsTrigger>
            <TabsTrigger value="upvoted">アップボート</TabsTrigger>
            <TabsTrigger value="achievements">実績</TabsTrigger>
          </TabsList>
          
          <TabsContent value="models" className="mt-6">
            <div className="space-y-6">
              {userModels.length > 0 ? (
                userModels.map((model, index) => (
                  <BusinessModelCard 
                    key={model.id} 
                    model={model} 
                    rank={index + 1}
                    compact
                  />
                ))
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-600">まだビジネスモデルを投稿していません</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="upvoted" className="mt-6">
            <Card>
              <CardContent className="p-12 text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600">アップボートしたモデルはまだありません</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">トップコントリビューター</h3>
                      <p className="text-sm text-gray-600">10個以上のモデルを投稿</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                      <Star className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">人気クリエイター</h3>
                      <p className="text-sm text-gray-600">合計1000以上のアップボートを獲得</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">アクティブコメンター</h3>
                      <p className="text-sm text-gray-600">100以上のコメントを投稿</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">アーリーアダプター</h3>
                      <p className="text-sm text-gray-600">サービス開始初期からの参加</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
