import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchBusinessModel, fetchBusinessModels } from '@/lib/db-helpers';
import ModelDetailClient from './ModelDetailClient';

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const model = await fetchBusinessModel(params.id);
  
  if (!model) {
    return {
      title: 'ビジネスモデルが見つかりません - NicheHunt',
    };
  }

  return {
    title: `${model.title} - NicheHunt`,
    description: model.description,
  };
}

export async function generateStaticParams() {
  const models = await fetchBusinessModels();
  
  return models.map((model) => ({
    id: model.id,
  }));
}

export default async function BusinessModelDetailPage({ params }: PageProps) {
  const model = await fetchBusinessModel(params.id);

  if (!model) {
    notFound();
  }

  return <ModelDetailClient model={model} />;
}
