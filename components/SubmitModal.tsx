'use client';

import { useState, useEffect } from 'react'; // Removed useRef as it's no longer needed for the custom toolbar
import { useRouter } from 'next/navigation';
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
// Textarea, Tabs, ReactMarkdown, remarkGfm are removed as MDEditor will handle this.
// Specific lucide icons for the old toolbar (Bold, Italic, etc.) are also removed.
import MDEditor from '@uiw/react-md-editor'; // Import MDEditor
import '@uiw/react-md-editor/markdown-editor.css'; // Default theme


import { 
  X, 
  Upload, 
  Link as LinkIconLucide, 
  Github,
  Play,
  Image as ImageIcon,
  Calendar,
  Tag,
  AlertCircle
} from 'lucide-react';
import { createProduct, uploadProductImage } from '@/lib/api/products-create';
import { fetchCategories } from '@/lib/api/categories-tags';
import type { Category } from '@/lib/types/database';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubmitModal({ isOpen, onClose }: SubmitModalProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '', // This will be handled by MDEditor
    product_url: '',
    github_url: '',
    demo_url: '',
    category_id: '',
    launch_date: new Date().toISOString().split('T')[0],
    tags: [] as string[],
  });

  const [productImageFiles, setProductImageFiles] = useState<File[]>([]);
  const [productImagePreviews, setProductImagePreviews] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  // textareaRef and custom markdown helpers are removed

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data } = await fetchCategories();
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('カテゴリの読み込みに失敗しました');
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const MAX_IMAGES = 5; 

  const handleProductImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles: File[] = [];
      const newPreviews: string[] = [];
      
      if (productImageFiles.length + files.length > MAX_IMAGES) {
        toast.error(`画像は最大${MAX_IMAGES}枚までアップロードできます`);
        return;
      }

      Array.from(files).forEach(file => {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name}の画像サイズは5MB以下にしてください`);
          return; 
        }
        newFiles.push(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          if (newPreviews.length === newFiles.length) {
            setProductImageFiles(prevFiles => [...prevFiles, ...newFiles]);
            setProductImagePreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeProductImage = (index: number) => {
    setProductImageFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    setProductImagePreviews(prevPreviews => prevPreviews.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'プロダクト名は必須です';
    if (!formData.tagline.trim()) newErrors.tagline = 'キャッチコピーは必須です';
    if (!formData.description.trim()) newErrors.description = '詳細説明は必須です'; // MDEditor ensures this isn't empty
    if (!formData.category_id) newErrors.category_id = 'カテゴリーを選択してください';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('投稿するにはログインが必要です');
      onClose(); 
      router.push('/auth/signin'); 
      return;
    }
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const imageUrls: string[] = [];
      for (const file of productImageFiles) {
        const { url, error: uploadError } = await uploadProductImage(file);
        if (uploadError) throw new Error(`画像 (${file.name}) のアップロードに失敗しました`);
        if (url) imageUrls.push(url);
      }
      const { data: product, error } = await createProduct({
        name: formData.name,
        tagline: formData.tagline,
        description: formData.description,
        product_url: formData.product_url || undefined,
        github_url: formData.github_url || undefined,
        demo_url: formData.demo_url || undefined,
        thumbnail_url: imageUrls.length > 0 ? imageUrls[0] : undefined,
        image_urls: imageUrls,
        category_id: parseInt(formData.category_id),
        tags: formData.tags,
        launch_date: formData.launch_date,
      });
      if (error) throw error;
      toast.success('プロダクトを投稿しました！');
      setFormData({
        name: '', tagline: '', description: '', product_url: '', github_url: '',
        demo_url: '', category_id: '', 
        launch_date: new Date().toISOString().split('T')[0], tags: [],
      });
      setProductImageFiles([]);
      setProductImagePreviews([]);
      setErrors({});
      onClose();
      if (product) router.push(`/products/${product.id}`);
    } catch (error) {
      console.error('Error submitting product:', error);
      toast.error(error instanceof Error ? error.message : 'プロダクトの投稿に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (currentTag.trim()) {
      const newTags = currentTag.split(',').map(tag => tag.trim()).filter(tag => tag && !formData.tags.includes(tag));
      if (newTags.length > 0) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, ...newTags] }));
        setCurrentTag('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentTag(value);
    if (value.endsWith(',')) {
      const tagValue = value.slice(0, -1).trim();
      if (tagValue && !formData.tags.includes(tagValue)) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, tagValue] }));
        setCurrentTag('');
      }
    }
  };

  // Custom Markdown helpers and MarkdownToolbar are removed.

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            新しいプロダクトを投稿
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            あなたのプロダクトやプロジェクトをコミュニティと共有しましょう
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本情報 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">基本情報</h3>
            
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                プロダクト名 *
              </Label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="例: NicheNext"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="tagline" className="text-sm font-medium text-gray-700">
                キャッチコピー *
              </Label>
              <input
                id="tagline"
                type="text"
                required
                value={formData.tagline}
                onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                className={`mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.tagline ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="例: ニッチなプロダクトを発見・共有するプラットフォーム"
              />
              {errors.tagline && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.tagline}
                </p>
              )}
            </div>

            {/* Description field with MDEditor */}
            <div>
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                詳細説明 *
              </Label>
              <div className="mt-1" data-color-mode="light"> {/* data-color-mode for MDEditor theme */}
                <MDEditor
                  value={formData.description}
                  onChange={(value) => {
                    setFormData(prev => ({ ...prev, description: value || '' }));
                  }}
                  height={300} // Adjust height as needed
                  previewOptions={{
                    components: {
                      a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" />
                    }
                  }}
                />
              </div>
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                  カテゴリー *
                </Label>
                <select
                  id="category"
                  required
                  value={formData.category_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                  className={`mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.category_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isLoadingCategories}
                >
                  <option value="">
                    {isLoadingCategories ? '読み込み中...' : 'カテゴリーを選択'}
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.category_id}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="launch_date" className="text-sm font-medium text-gray-700">
                  ローンチ日
                </Label>
                <div className="mt-1 relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    id="launch_date"
                    type="date"
                    value={formData.launch_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, launch_date: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* プロダクト画像 */}
            <div>
              <Label htmlFor="product_images" className="text-sm font-medium text-gray-700">
                プロダクト画像 (最大{MAX_IMAGES}枚)
              </Label>
              <div className="mt-1">
                <input
                  id="product_images"
                  type="file"
                  accept="image/*"
                  multiple 
                  onChange={handleProductImagesChange}
                  className="hidden"
                  disabled={productImageFiles.length >= MAX_IMAGES}
                />
                <label
                  htmlFor="product_images"
                  className={`cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    productImageFiles.length >= MAX_IMAGES ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  画像を選択
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  各画像 最大5MB。最初の画像がサムネイルとして使用されます。
                </p>
              </div>

              {productImagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {productImagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`プロダクト画像プレビュー ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeProductImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                        aria-label={`画像を削除 ${index + 1}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* リンク */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">リンク</h3>

            <div>
              <Label htmlFor="product_url" className="text-sm font-medium text-gray-700">
                プロダクトURL
              </Label>
              <div className="mt-1 relative">
                <LinkIconLucide className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  id="product_url"
                  type="url"
                  value={formData.product_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, product_url: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="github_url" className="text-sm font-medium text-gray-700">
                  GitHub URL
                </Label>
                <div className="mt-1 relative">
                  <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    id="github_url"
                    type="url"
                    value={formData.github_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, github_url: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://github.com/username/repo"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="demo_url" className="text-sm font-medium text-gray-700">
                  デモURL
                </Label>
                <div className="mt-1 relative">
                  <Play className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    id="demo_url"
                    type="url"
                    value={formData.demo_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, demo_url: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://demo.example.com"
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
              <div 
                className="mt-1 flex flex-wrap items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent cursor-text min-h-[42px]"
                onClick={() => document.getElementById('tags-input')?.focus()}
              >
                {formData.tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className="flex items-center space-x-1 bg-blue-100 text-blue-700 px-2 py-1"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTag(tag);
                      }}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                <input
                  id="tags-input"
                  type="text"
                  value={currentTag}
                  onChange={handleTagInputChange}
                  onKeyPress={handleKeyPress}
                  className="flex-1 min-w-[200px] outline-none bg-transparent"
                  placeholder={formData.tags.length === 0 ? "タグをコンマ区切りで入力（例: React, TypeScript, Next.js）" : "タグを追加..."}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Enterキーまたはコンマで区切ってタグを追加
              </p>
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
