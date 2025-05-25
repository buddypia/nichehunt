import { Metadata } from 'next';
import ProfileDetailClient from './ProfileDetailClient';

interface ProfileDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: ProfileDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  
  return {
    title: `プロフィール - NicheHunt`,
    description: 'ユーザープロフィール',
  };
}

export async function generateStaticParams() {
  // 静的エクスポートのため、1-20のIDを生成
  return Array.from({ length: 20 }, (_, i) => ({
    id: String(i + 1)
  }));
}

export default async function ProfileDetailPage({ params }: ProfileDetailPageProps) {
  const { id } = await params;

  return <ProfileDetailClient userId={id} />;
}
