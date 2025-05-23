import { businessModels } from '@/data/businessModels';
import ModelDetailClient from './ModelDetailClient';

// 静的パスの生成（サーバーコンポーネント）
export async function generateStaticParams() {
  return businessModels.map((model) => ({
    id: model.id,
  }));
}

// サーバーコンポーネント
export default function ModelDetailPage({ params }: { params: { id: string } }) {
  const model = businessModels.find(m => m.id === params.id);

  return <ModelDetailClient model={model} />;
}
