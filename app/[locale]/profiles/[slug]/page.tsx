import ProfileDetailClient from '../../../profiles/[slug]/ProfileDetailClient';

interface LocaleProfileDetailPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export default async function LocaleProfileDetailPage({ params }: LocaleProfileDetailPageProps) {
  const { slug } = await params;
  
  return <ProfileDetailClient userSlug={slug} />;
}
