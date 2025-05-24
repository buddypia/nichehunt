'use client';

import { useState, useEffect, useMemo } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { SearchStats } from '@/components/SearchStats';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getProducts, getTrendingProducts } from '@/lib/api/products-client';
import { fetchCategories, fetchTags } from '@/lib/api/categories-tags';
import { ProductWithRelations, Category, Tag } from '@/lib/types/database';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Clock, Package } from 'lucide-react';
import { useSearch } from '@/contexts/SearchContext';

type ViewMode = 'all' | 'trending' | 'new';

export default function ProductsClient() {
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const { searchQuery, selectedCategory, setSelectedCategory } = useSearch();

  // Fetch categories and tags on mount
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [categoriesData, tagsData] = await Promise.all([
          fetchCategories(),
          fetchTags()
        ]);
        setCategories(categoriesData.data || []);
        setTags(tagsData.data || []);
      } catch (error) {
        console.error('Error loading metadata:', error);
      }
    };
    
    loadMetadata();
  }, []);

  // Fetch products based on filters
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      
      try {
        let result;
        
        if (viewMode === 'trending') {
          const trendingProducts = await getTrendingProducts();
          setProducts(trendingProducts);
        } else {
          const productsResult = await getProducts({
            search: searchQuery || undefined,
            categorySlug: selectedCategory !== 'all' ? selectedCategory : undefined,
            tagSlug: selectedTag !== 'all' ? selectedTag : undefined,
            sort: viewMode === 'new' ? 'newest' : 'popular'
          });
          
          if (!productsResult.error) {
            setProducts(productsResult.products);
          }
        }
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [viewMode, selectedCategory, selectedTag, searchQuery]);

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    
    const query = searchQuery.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.tagline.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  const getViewTitle = () => {
    if (searchQuery) {
      return `「${searchQuery}」の検索結果`;
    }
    
    switch (viewMode) {
      case 'trending':
        return 'トレンドプロダクト';
      case 'new':
        return '新着プロダクト';
      default:
        return 'すべてのプロダクト';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">プロダクト</h1>
          <p className="text-gray-600">実際に立ち上げられたプロダクトやサービスを探索</p>
        </div>

        {/* View Mode Tabs */}
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)} className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              すべて
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              トレンド
            </TabsTrigger>
            <TabsTrigger value="new" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              新着
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filters */}
        {viewMode === 'all' && (
          <div className="mb-6 flex flex-wrap gap-4">
            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">カテゴリ</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">すべて</option>
                {categories.map(category => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tag Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">タグ</label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">すべて</option>
                {tags.map(tag => (
                  <option key={tag.id} value={tag.slug}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Search Stats */}
        {searchQuery && (
          <SearchStats
            query={searchQuery}
            resultCount={filteredProducts.length}
            topCategory=""
            avgUpvotes={0}
            avgComments={0}
          />
        )}

        {/* Results Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            {getViewTitle()}
          </h2>
          <p className="text-gray-600">
            {filteredProducts.length}件のプロダクトが見つかりました
          </p>
        </div>

        {/* Products List */}
        {isLoading ? (
          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="flex items-start space-x-4">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <Skeleton className="w-16 h-16" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  該当するプロダクトが見つかりません
                </h3>
                <p className="text-gray-600">
                  検索条件を変更するか、新しいプロダクトを投稿してみてください
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// Add missing imports
import { Card } from '@/components/ui/card';
