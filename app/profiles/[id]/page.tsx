import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchProfileByUsername, fetchBusinessModelsByUser } from '@/lib/db-helpers';
import ProfileDetailClient from './ProfileDetailClient';
import { supabase } from '@/lib/supabase';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const profile = await fetchProfileByUsername(id);
  
  if (!profile) {
    return {
      title: 'プロフィールが見つかりません - NicheHunt',
    };
  }

  return {
    title: `${profile.username} - NicheHunt`,
    description: profile.bio || `${profile.username}さんのプロフィール`,
  };
}

export async function generateStaticParams() {
  // Fetch all profiles from the database
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('username');

  if (error || !profiles) {
    console.error('Error fetching profiles:', error);
    return [];
  }

  return profiles.map((profile) => ({
    id: profile.username,
  }));
}

export default async function ProfileDetailPage({ params }: PageProps) {
  const { id } = await params;
  const profile = await fetchProfileByUsername(id);

  if (!profile) {
    notFound();
  }

  return <ProfileDetailClient userId={profile.id} />;
}
