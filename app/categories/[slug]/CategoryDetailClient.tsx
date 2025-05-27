'use client';

import { useState, useEffect, useRef } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { FilterTopBar } from '@/components/FilterTopBar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, Clock, MessageCircle, Star, 
  ChevronLeft, Filter, Loader2, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase-client';
import type { ProductWithRelations } from '@/lib/types/database';
import { motion, AnimatePresence } from 'framer-motion';
import { SubmitModal } from '@/components/SubmitModal';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon_name: string | null;
  created_at: string;
}

interface CategoryDetailClientProps {
  category: Category;
  initialProducts: ProductWithRelations[];
  featuredProducts: ProductWithRelations[];
}

export default function CategoryDetailClient({ 
  category, 
  initialProducts,
  featuredProducts 
}: CategoryDetailClientProps) {
  const [products, setProducts] = useState<ProductWithRelations[]>(initialProducts);
  const [sortBy, setSortBy] = useState<"popular" | "newest" | "comments" | "featured">("popular");
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [showSortChange, setShowSortChange] = useState(false);
  const [sortDisplayName, setSortDisplayName] = useState<string | null>(null);
  const productsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    fetchProducts();
  }, [sortBy, searchQuery]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('products_with_stats')
        .select('*')
        .eq('status', 'published' as any)
        .eq('category_id', category.id);

      // 検索フィルタ
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,tagline.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      // ソート
      switch (sortBy) {
        case "popular":
          query = query.order('vote_count', { ascending: false });
          break;
        case "newest":
          query = query.order('launch_date', { ascending: false });
          break;
        case "comments":
          query = query.order('comment_count', { ascending: false });
          break;
        case "featured":
          query = query.eq('featured', true).order('launch_date', { ascending: false });
          break;
      }

      query = query.limit(20);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        return;
      }

      // プロファイル情報を追加
      const enrichedProducts = await Promise.all((data || []).filter((item): item is any => item && typeof item === 'object').map(async (product) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', product.user_id)
          .single();
        
        const { data: productTags } = await supabase
          .from('product_tags')
          .select('tag_id')
          .eq('product_id', product.id);

        let tags: any[] = [];
        if (productTags && Array.isArray(productTags) && productTags.length > 0) {
          const tagIds = productTags
            .filter((pt: any) => pt && 'tag_id' in pt)
            .map((pt: any) => pt.tag_id);
          
          if (tagIds.length > 0) {
            const { data: tagData } = await supabase
              .from('tags')
              .select('*')
              .in('id', tagIds);
            tags = tagData || [];
          }
        }

        return {
          ...product,
          profile,
          category,
          tags,
        } as ProductWithRelations;
      }));

      setProducts(enrichedProducts);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSortChange = (newSortBy: "popular" | "newest" | "comments" | "featured") => {
    setSortBy(newSortBy);
    
    // ソート名を設定
    const sortNames = {
      popular: "人気順",
      newest: "新着順",
      comments: "コメント順",
      featured: "注目順"
    };
    setSortDisplayName(sortNames[newSortBy]);
    
    // 変更通知を表示
    setShowSortChange(true);
    setTimeout(() => setShowSortChange(false), 3000);
    
    // プロダクト一覧セクションまでスムーズスクロール
    setTimeout(() => {
      productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleVote = (productId: number) => {
    // 楽観的更新
    setProducts(prev => prev.map(p => 
      p.id === productId 
        ? { ...p, vote_count: (p.vote_count || 0) + 1, has_voted: true }
        : p
    ));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSubmitClick = () => {
    setIsSubmitModalOpen(true);
  };

  return (
    <main className="min-h-screen">
      {/* フィルタートップバー（カテゴリ選択を非表示） */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">並び替え:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSortChange("popular")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === "popular"
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  人気順
                </button>
                <button
                  onClick={() => handleSortChange("newest")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === "newest"
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  <Clock className="w-3 h-3 inline mr-1" />
                  新着順
                </button>
                <button
                  onClick={() => handleSortChange("comments")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === "comments"
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  <MessageCircle className="w-3 h-3 inline mr-1" />
                  コメント順
                </button>
                <button
                  onClick={() => handleSortChange("featured")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === "featured"
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  <Star className="w-3 h-3 inline mr-1" />
                  注目順
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* パンくずリスト */}
        <div className="mb-6">
          <Link href="/categories" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-4 h-4 mr-1" />
            カテゴリー一覧に戻る
          </Link>
        </div>

        {/* カテゴリーヘッダー */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{category.name}</h1>
          {category.description && (
            <p className="text-lg text-muted-foreground mb-4">{category.description}</p>
          )}
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-sm">
              {products.length}件のプロダクト
            </Badge>
            <button
              onClick={handleSubmitClick}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              このカテゴリーに投稿する
            </button>
          </div>
        </div>

        {/* 検索バー */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <input
              type="text"
              placeholder={`${category.name}のプロダクトを検索...`}
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-4 py-3 pl-10 pr-4 bg-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* 注目のプロダクト（カテゴリー内） */}
        {featuredProducts.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-500" />
                <div>
                  <h2 className="text-2xl font-bold">{category.name}の注目プロダクト</h2>
                  <p className="text-muted-foreground mt-1">
                    このカテゴリーで特に注目すべきプロダクト
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {featuredProducts.slice(0, 3).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onVote={handleVote}
                  className="border-2 border-yellow-200 dark:border-yellow-800 shadow-yellow-100"
                />
              ))}
            </div>
          </section>
        )}

        {/* プロダクト一覧 */}
        <section ref={productsRef} className="relative scroll-mt-20">
          {/* ソート変更時の通知バナー */}
          <AnimatePresence>
            {showSortChange && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute -top-16 left-0 right-0 z-20"
              >
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg p-4 shadow-lg flex items-center justify-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-medium">
                    {sortDisplayName && `「${sortDisplayName}」でプロダクトを表示中`}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            className="flex items-center gap-3 mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </motion.div>
            )}
            <h2 className="text-2xl font-bold">
              {searchQuery ? "検索結果" : "すべてのプロダクト"}
            </h2>
            {isLoading && (
              <span className="text-sm text-muted-foreground animate-pulse">
                更新中...
              </span>
            )}
          </motion.div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-full mb-4" />
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onVote={handleVote}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? `「${searchQuery}」に一致するプロダクトが見つかりませんでした。`
                    : `${category.name}のプロダクトはまだ投稿されていません。`
                  }
                </p>
                <button
                  onClick={handleSubmitClick}
                  className="mt-4 text-primary hover:text-primary/80"
                >
                  最初のプロダクトを投稿する
                </button>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
      
      {/* 投稿モーダル */}
      <SubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
      />
    </main>
  );
}
