'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Bookmark, Edit2, Trash2, Plus, Check, X, ChevronRight } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ProductWithRelations, Collection } from '@/lib/types/database';
import { 
  getUserCollections, 
  getCollectionProducts,
  createCollection, 
  updateCollection,
  deleteCollection 
} from '@/lib/api/collections';
import { getCurrentUser } from '@/lib/auth';

const DEFAULT_COLLECTION_NAME = 'Default Collection';

export default function SavedModelsClient() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [collectionProducts, setCollectionProducts] = useState<ProductWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  
  // 編集関連の状態
  const [editingCollectionId, setEditingCollectionId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  
  // 新規作成ダイアログの状態
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadCollections();
    } else {
      setIsLoading(false);
    }
  }, [currentUser]);

  const loadCurrentUser = async () => {
    const user = await getCurrentUser();
    setCurrentUser(user);
    
    // If no user found, redirect to signin
    if (!user) {
      router.push('/auth/signin');
      return;
    }
  };

  const loadCollections = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const userCollections = await getUserCollections(currentUser.id);
      setCollections(userCollections);
      
      // デフォルトで最初のコレクションを選択
      if (userCollections.length > 0 && !selectedCollection) {
        setSelectedCollection(userCollections[0]);
        await loadCollectionProducts(userCollections[0].id);
      }
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCollectionProducts = async (collectionId: number) => {
    setIsLoadingProducts(true);
    try {
      const products = await getCollectionProducts(collectionId);
      setCollectionProducts(products);
    } catch (error) {
      console.error('Error loading collection products:', error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleSelectCollection = async (collection: Collection) => {
    setSelectedCollection(collection);
    await loadCollectionProducts(collection.id);
  };

  const handleStartEdit = (collection: Collection) => {
    setEditingCollectionId(collection.id);
    setEditingName(collection.name);
    setEditingDescription(collection.description || '');
  };

  const handleCancelEdit = () => {
    setEditingCollectionId(null);
    setEditingName('');
    setEditingDescription('');
  };

  const handleSaveEdit = async () => {
    if (!editingCollectionId || !editingName.trim()) return;
    
    const updatedCollection = await updateCollection(editingCollectionId, {
      name: editingName.trim(),
      description: editingDescription.trim()
    });
    
    if (updatedCollection) {
      setCollections(collections.map(col => 
        col.id === editingCollectionId ? updatedCollection : col
      ));
      
      if (selectedCollection?.id === editingCollectionId) {
        setSelectedCollection(updatedCollection);
      }
      
      handleCancelEdit();
    }
  };

  const handleCreateCollection = async () => {
    if (!currentUser || !newCollectionName.trim()) return;
    
    const newCollection = await createCollection(
      currentUser.id,
      newCollectionName.trim(),
      newCollectionDescription.trim()
    );
    
    if (newCollection) {
      setCollections([newCollection, ...collections]);
      setIsCreateDialogOpen(false);
      setNewCollectionName('');
      setNewCollectionDescription('');
      
      // 新しく作成したコレクションを選択
      setSelectedCollection(newCollection);
      setCollectionProducts([]);
    }
  };

  const handleDeleteCollection = async (collectionId: number) => {
    if (!confirm('このコレクションを削除してもよろしいですか？')) return;
    
    const success = await deleteCollection(collectionId);
    if (success) {
      setCollections(collections.filter(col => col.id !== collectionId));
      
      if (selectedCollection?.id === collectionId) {
        const remainingCollections = collections.filter(col => col.id !== collectionId);
        if (remainingCollections.length > 0) {
          setSelectedCollection(remainingCollections[0]);
          await loadCollectionProducts(remainingCollections[0].id);
        } else {
          setSelectedCollection(null);
          setCollectionProducts([]);
        }
      }
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
              マイコレクションを表示するにはログインしてください
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">マイコレクション</h1>
          <p className="text-gray-600">
            後で見返したいビジネスモデルのコレクション
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* コレクション一覧 */}
            <div className="lg:col-span-1">
              <div className="mb-4">
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  新しいコレクション
                </Button>
              </div>
              
              <div className="space-y-2">
                {collections.map((collection) => (
                  <Card
                    key={collection.id}
                    className={`cursor-pointer transition-all ${
                      selectedCollection?.id === collection.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => handleSelectCollection(collection)}
                  >
                    <CardHeader className="p-4">
                      {editingCollectionId === collection.id ? (
                        <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            placeholder="コレクション名"
                            className="mb-2"
                          />
                          <Textarea
                            value={editingDescription}
                            onChange={(e) => setEditingDescription(e.target.value)}
                            placeholder="説明（任意）"
                            className="mb-2 min-h-[60px]"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={handleSaveEdit}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">
                              {collection.name}
                            </CardTitle>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </div>
                          {collection.description && (
                            <CardDescription className="text-xs mt-1">
                              {collection.description}
                            </CardDescription>
                          )}
                          <div className="flex gap-1 mt-2" onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleStartEdit(collection)}
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            {collection.name !== DEFAULT_COLLECTION_NAME && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteCollection(collection.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </>
                      )}
                    </CardHeader>
                  </Card>
                ))}
              </div>
              
              {collections.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Bookmark className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">コレクションがありません</p>
                </div>
              )}
            </div>

            {/* プロダクト一覧 */}
            <div className="lg:col-span-3">
              {selectedCollection ? (
                <>
                  <h2 className="text-xl font-semibold mb-4">{selectedCollection.name}</h2>
                  {isLoadingProducts ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    </div>
                  ) : collectionProducts.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                      <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        このコレクションは空です
                      </h3>
                      <p className="text-gray-500 mb-6">
                        気に入ったビジネスモデルをコレクションに追加してください
                      </p>
                      <Button
                        onClick={() => router.push('/')}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      >
                        モデルを探す
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {collectionProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onVote={() => loadCollectionProducts(selectedCollection.id)}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    コレクションを選択してください
                  </h3>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 新規作成ダイアログ */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新しいコレクションを作成</DialogTitle>
            <DialogDescription>
              ビジネスモデルを整理するための新しいコレクションを作成します
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                コレクション名 <span className="text-red-500">*</span>
              </label>
              <Input
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="例：AI関連のビジネス"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                説明（任意）
              </label>
              <Textarea
                value={newCollectionDescription}
                onChange={(e) => setNewCollectionDescription(e.target.value)}
                placeholder="このコレクションについての説明"
                className="min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setNewCollectionName('');
                setNewCollectionDescription('');
              }}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleCreateCollection}
              disabled={!newCollectionName.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            >
              作成
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
