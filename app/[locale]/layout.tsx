import { Metadata } from 'next';


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  
  if (locale === 'ja') {
    return {
      title: 'NicheNext - ニッチ市場向けビジネスアイデアプラットフォーム',
      description: '革新的なニッチビジネスモデルを発見・共有するためのプラットフォーム',
    };
  }
  
  return {
    title: 'NicheNext - Niche Business Ideas Platform',
    description: 'Discover and share innovative niche business models',
  };
}

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

export async function generateStaticParams() {
  return [
    { locale: 'ja' },
    { locale: 'en' },
  ];
}