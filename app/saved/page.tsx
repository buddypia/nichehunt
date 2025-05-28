import { Metadata } from 'next';
import SavedModelsClient from './SavedModelsClient';

export const metadata: Metadata = {
  title: 'マイコレクション - NicheNext',
  description: 'お気に入りのビジネスモデルコレクション',
};

export default function SavedModelsPage() {
  return <SavedModelsClient />;
}
