import { Metadata } from 'next';
import ProfileDetailClient from './ProfileDetailClient';
import { createStaticClient } from '@/lib/supabase/static';

interface ProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

// 静的エクスポート用のパラメータ生成
export async function generateStaticParams() {
  const supabase = createStaticClient();
  
  try {
    // プロフィールIDのリストを取得
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(100); // 必要に応じて調整
    
    if (error) {
      console.error('Error fetching profiles:', error);
      return [];
    }
    
    // idパラメータの配列を返す
    return (profiles || []).map((profile) => ({
      id: profile.id,
    }));
  } catch (error) {
    console.error('Error in generateStaticParams:', error);
    return [];
  }
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `プロフィール - NicheNext`,
    description: 'ユーザープロフィールの詳細ページ',
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  return <ProfileDetailClient userId={id} />;
}
