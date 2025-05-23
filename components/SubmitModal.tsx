'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  X, 
  Upload, 
  Link as LinkIcon, 
  DollarSign, 
  Users, 
  Target,
  Lightbulb,
  TrendingUp,
  Globe,
  Calendar,
  Tag
} from 'lucide-react';

interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = [
  { id: 'subscription', name: 'サブスクリプション', emoji: '📦' },
  { id: 'marketplace', name: 'マーケットプレイス', emoji: '🛍️' },
  { id: 'education', name: '教育・学習', emoji: '📚' },
  { id: 'ai', name: 'AI・テクノロジー', emoji: '🤖' },
  { id: 'workspace', name: 'ワークスペース', emoji: '🏢' },
  { id: 'rental', name: 'レンタル・シェア', emoji: '🔄' },
  { id: 'health', name: 'ヘルス・ウェルネス', emoji: '💪' },
  { id: 'food', name: 'フード・飲食', emoji: '🍽️' },
  { id: 'finance', name: 'フィンテック', emoji: '💰' },
  { id: 'sustainability', name: 'サステナビリティ', emoji: '🌱' },
  { id: 'entertainment', name: 'エンターテインメント', emoji: '🎮' },
  { id: 'healthcare', name: 'ヘルスケア', emoji: '🏥' }
];

export function SubmitModal({ isOpen, onClose }: SubmitModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    website: '',
    revenue_model: '',
    target_market: '',
    unique_value: '',
    market_size: '',
    launch_date: '',
    tags: [] as string[],
  });

  const [currentTag, setCurrentTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // TODO: Implement Supabase submission
    console.log('Submitting:', formData);
    
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        website: '',
        revenue_model: '',
        target_market: '',
        unique_value: '',
        market_size: '',
        launch_date: '',
        tags: [],
      });
    }, 2000);
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Lightbulb className="w-6 h-6 text-yellow-500" />
            <span>新しいビジネスモデルを投稿</span>
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            あなたが発見した革新的なニッチビジネスモデルをコミュニティと共有しましょう
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本情報 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>基本情報</span>
            </h3>
            
            <div>
              <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                ビジネスモデル名 *
              </Label>
              <input
                id="title"
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="例: ペット専用サブスクボックス"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                詳細説明 *
              </Label>
              <textarea
                id="description"
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ビジネスモデルの詳細、特徴、なぜ注目すべきかを説明してください..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                  カテゴリー *
                </Label>
                <select
                  id="category"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">カテゴリーを選択</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.emoji} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="website" className="text-sm font-medium text-gray-700">
                  ウェブサイト
                </Label>
                <div className="mt-1 relative">
                  <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ビジネス詳細 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>ビジネス詳細</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="revenue_model" className="text-sm font-medium text-gray-700">
                  収益モデル
                </Label>
                <input
                  id="revenue_model"
                  type="text"
                  value={formData.revenue_model}
                  onChange={(e) => setFormData(prev => ({ ...prev, revenue_model: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="例: 月額サブスクリプション、手数料モデル"
                />
              </div>

              <div>
                <Label htmlFor="target_market" className="text-sm font-medium text-gray-700">
                  ターゲット市場
                </Label>
                <input
                  id="target_market"
                  type="text"
                  value={formData.target_market}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_market: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="例: ペット愛好家、都市部の若年層"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="unique_value" className="text-sm font-medium text-gray-700">
                独自の価値提案
              </Label>
              <textarea
                id="unique_value"
                rows={3}
                value={formData.unique_value}
                onChange={(e) => setFormData(prev => ({ ...prev, unique_value: e.target.value }))}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="このビジネスモデルの独自性や競合優位性について説明してください..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="market_size" className="text-sm font-medium text-gray-700">
                  市場規模
                </Label>
                <input
                  id="market_size"
                  type="text"
                  value={formData.market_size}
                  onChange={(e) => setFormData(prev => ({ ...prev, market_size: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="例: 100億円市場、ニッチだが成長中"
                />
              </div>

              <div>
                <Label htmlFor="launch_date" className="text-sm font-medium text-gray-700">
                  ローンチ時期
                </Label>
                <div className="mt-1 relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    id="launch_date"
                    type="text"
                    value={formData.launch_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, launch_date: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例: 2024年春、既にローンチ済み"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* タグ */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Tag className="w-5 h-5" />
              <span>タグ</span>
            </h3>

            <div>
              <Label htmlFor="tags" className="text-sm font-medium text-gray-700">
                関連タグを追加
              </Label>
              <div className="mt-1 flex space-x-2">
                <input
                  id="tags"
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="タグを入力してEnterキーを押す"
                />
                <Button type="button" onClick={addTag} variant="outline">
                  追加
                </Button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 送信ボタン */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isSubmitting ? (
                <>
                  <Upload className="w-4 h-4 mr-2 animate-spin" />
                  投稿中...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  投稿する
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
