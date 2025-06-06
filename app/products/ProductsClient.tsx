'use client';

import { useState, useEffect, useMemo } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { getProducts } from '@/lib/api/products-client';
import { fetchCategories, fetchTags } from '@/lib/api/categories-tags';
import { ProductWithRelations, Category, Tag } from '@/lib/types/database';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearch } from '@/contexts/SearchContext';

export default function ProductsClient({ countryCode }: { countryCode?: string }) {
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [categories, setCategories] = useState<Category[]>([]); // Keep for now, might be used by Tag filter or other parts
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const { searchQuery } = useSearch(); // Removed selectedCategory, setSelectedCategory

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
        const productsResult = await getProducts({
          search: searchQuery || undefined,
          // categorySlug: selectedCategory !== 'all' ? selectedCategory : undefined, // Removed
          tagSlug: selectedTag !== 'all' ? selectedTag : undefined,
          sort: 'popular',
          countryCode: countryCode
        });
        
        if (!productsResult.error) {
          setProducts(productsResult.products);
        }
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [selectedTag, searchQuery, countryCode]); // 国コードも依存配列に追加

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
    return 'すべてのプロダクト';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">プロダクト</h1>
          <p className="text-gray-600">実際に立ち上げられたプロダクトやサービスを探索</p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-8">
            {/* Category Filter Removed */}

            {/* Tag Filter */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">タグ</h3>
                  <p className="text-xs text-gray-500">トピックやテーマで探す</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedTag('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedTag === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-700 border border-blue-200 hover:border-blue-300'
                  }`}
                >
                  すべて
                </button>
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => setSelectedTag(tag.slug)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                      selectedTag === tag.slug
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md transform scale-105'
                        : 'bg-purple-50 text-purple-700 border border-purple-200 hover:border-purple-300 hover:bg-purple-100'
                    }`}
                  >
                    #{tag.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Skeleton className="w-16 h-16 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
