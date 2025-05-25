import { Metadata } from 'next';
import SavedModelsClient from './SavedModelsClient';

export const metadata: Metadata = {
  title: '保存したモデル - NicheNext',
  description: '保存したビジネスモデルの一覧',
};

export default function SavedModelsPage() {
  return <SavedModelsClient />;
}
