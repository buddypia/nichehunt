'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { BusinessModelCard } from '@/components/BusinessModelCard';
import { Button } from '@/components/ui/button';
import { BusinessModel } from '@/types/BusinessModel';
import { getSavedModels } from '@/lib/api/collections';
import { getCurrentUser } from '@/lib/auth';

export default function SavedModelsClient() {
  const router = useRouter();
  const [savedModels, setSavedModels] = useState<BusinessModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadSavedModels();
    } else {
      setIsLoading(false);
    }
  }, [currentUser]);

  const loadCurrentUser = async () => {
    const user = await getCurrentUser();
    setCurrentUser(user);
  };

  const loadSavedModels = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const { businessModels } = await getSavedModels(currentUser.id);
      setSavedModels(businessModels);
    } catch (error) {
      console.error('Error loading saved models:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ログインが必要です
            </h3>
            <p className="text-gray-500 mb-6">
              保存したモデルを表示するにはログインしてください
            </p>
            <Button
              onClick={() => router.push('/auth/signin')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            >
              ログイン
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">保存したモデル</h1>
          <p className="text-gray-600">
            後で見返したいビジネスモデルのコレクション
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : savedModels.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              保存したモデルはありません
            </h3>
            <p className="text-gray-500 mb-6">
              気に入ったビジネスモデルを保存して、後で見返すことができます
            </p>
            <Button
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            >
              モデルを探す
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedModels.map((model) => (
              <div key={model.id} onClick={() => router.push(`/products/${model.id}`)}>
                <BusinessModelCard
                  model={model}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
