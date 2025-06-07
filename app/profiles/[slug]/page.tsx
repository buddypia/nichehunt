import { Metadata } from 'next';
import ProfileDetailClient from './ProfileDetailClient';
import { createClient } from '@/lib/supabase/client';

interface ProfilePageProps {
  params: Promise<{
    slug: string;
  }>;
}

// 静的エクスポート用のパラメータ生成
export async function generateStaticParams() {
  const supabase = createClient();
  
  try {
    // プロフィールslugのリストを取得
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('slug')
      .limit(100); // 必要に応じて調整
    
    if (error) {
      console.error('Error fetching profiles:', error);
      return [];
    }
    
    // slugパラメータの配列を返す
    return (profiles || []).map((profile) => ({
      slug: profile.slug,
    }));
  } catch (error) {
    console.error('Error in generateStaticParams:', error);
    return [];
  }
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `プロフィール - NicheNext`,
    description: 'ユーザープロフィールの詳細ページ',
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { slug } = await params;
  return <ProfileDetailClient userSlug={slug} />;
}
