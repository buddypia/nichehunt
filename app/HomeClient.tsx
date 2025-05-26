"use client"

import { useState, useEffect, useRef } from "react"
import { Hero } from "@/components/Hero"
import { ProductCard } from "@/components/ProductCard"
import { FilterTopBar } from "@/components/FilterTopBar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { TrendingUp, Clock, MessageCircle, Star, Trophy, Medal, Crown, Zap, Sparkles, ChevronRight, Users, Eye, Filter, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import type { ProductWithRelations } from "@/lib/types/database"
import { useSearch } from "@/contexts/SearchContext"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { SubmitModal } from "@/components/SubmitModal"

interface HomeClientProps {
  initialProducts: ProductWithRelations[]
  featuredProducts: ProductWithRelations[]
  todaysPicks: ProductWithRelations[]
}

export function HomeClient({ initialProducts, featuredProducts, todaysPicks }: HomeClientProps) {
  const [products, setProducts] = useState<ProductWithRelations[]>(initialProducts)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"popular" | "newest" | "comments" | "featured">("popular")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  const [showCategoryChange, setShowCategoryChange] = useState(false)
  const [categoryDisplayName, setCategoryDisplayName] = useState<string | null>(null)
  const [showSortChange, setShowSortChange] = useState(false)
  const [sortDisplayName, setSortDisplayName] = useState<string | null>(null)
  const { searchQuery, selectedCategory } = useSearch()
  const productsRef = useRef<HTMLElement>(null)

  useEffect(() => {
    // selectedCategoryが'all'でない場合はactiveCategoryとして使用
    if (selectedCategory && selectedCategory !== 'all') {
      setActiveCategory(selectedCategory)
    } else {
      setActiveCategory(null)
    }
  }, [selectedCategory])

  useEffect(() => {
    fetchProducts()
  }, [activeCategory, sortBy, searchQuery])

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      let query = supabase
        .from('products_with_stats')
        .select('*')
        .eq('status', 'published' as any)

      // カテゴリフィルタ
      if (activeCategory) {
        const { data: category } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', activeCategory as any)
          .single()
        
        if (category && 'id' in category) {
          query = query.eq('category_id', category.id)
        }
      }

      // 検索フィルタ
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,tagline.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      }

      // ソート
      switch (sortBy) {
        case "popular":
          query = query.order('vote_count', { ascending: false })
          break
        case "newest":
          query = query.order('launch_date', { ascending: false })
          break
        case "comments":
          query = query.order('comment_count', { ascending: false })
          break
        case "featured":
          query = query.eq('featured', true).order('launch_date', { ascending: false })
          break
      }

      query = query.limit(20)

      const { data, error } = await query

      if (error) {
        console.error('Error fetching products:', error)
        return
      }

      // プロファイル情報を追加
      const enrichedProducts = await Promise.all((data || []).filter((item): item is any => item && typeof item === 'object').map(async (product) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', product.user_id)
          .single()
        
        const { data: category } = await supabase
          .from('categories')
          .select('*')
          .eq('id', product.category_id)
          .single()

        const { data: productTags } = await supabase
          .from('product_tags')
          .select('tag_id')
          .eq('product_id', product.id)

        let tags: any[] = []
        if (productTags && Array.isArray(productTags) && productTags.length > 0) {
          const tagIds = productTags
            .filter((pt: any) => pt && 'tag_id' in pt)
            .map((pt: any) => pt.tag_id)
          
          if (tagIds.length > 0) {
            const { data: tagData } = await supabase
              .from('tags')
              .select('*')
              .in('id', tagIds)
            tags = tagData || []
          }
        }

        return {
          ...product,
          profile,
          category,
          tags,
        } as ProductWithRelations
      }))

      setProducts(enrichedProducts)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCategoryChange = async (categorySlug: string | null) => {
    setActiveCategory(categorySlug)
    
    // カテゴリー名を取得して表示
    if (categorySlug) {
      const { data: category } = await supabase
        .from('categories')
        .select('name')
        .eq('slug', categorySlug)
        .single()
      
      if (category && 'name' in category) {
        setCategoryDisplayName(category.name)
      }
    } else {
      setCategoryDisplayName(null)
    }
    
    // 変更通知を表示
    setShowCategoryChange(true)
    setTimeout(() => setShowCategoryChange(false), 3000)
    
    // プロダクト一覧セクションまでスムーズスクロール
    setTimeout(() => {
      productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const handleSortChange = (newSortBy: "popular" | "newest" | "comments" | "featured") => {
    setSortBy(newSortBy)
    
    // ソート名を設定
    const sortNames = {
      popular: "人気順",
      newest: "新着順",
      comments: "コメント順",
      featured: "注目順"
    }
    setSortDisplayName(sortNames[newSortBy])
    
    // 変更通知を表示
    setShowSortChange(true)
    setTimeout(() => setShowSortChange(false), 3000)
    
    // プロダクト一覧セクションまでスムーズスクロール
    setTimeout(() => {
      productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const handleVote = (productId: number) => {
    // 楽観的更新
    setProducts(prev => prev.map(p => 
      p.id === productId 
        ? { ...p, vote_count: (p.vote_count || 0) + 1, has_voted: true }
        : p
    ))
  }

  const handleSubmitClick = () => {
    setIsSubmitModalOpen(true)
  }

  return (
    <main className="min-h-screen">
      {/* フィルタートップバー */}
      <FilterTopBar
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
      />
      
      <Hero onSubmitClick={handleSubmitClick} />
      
      <div className="container mx-auto px-4 py-8">

        {/* 今日のピックアップ */}
        {todaysPicks.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-500" />
                  今日のピックアップ
                </h2>
                <p className="text-muted-foreground mt-1">
                  本日投稿された注目のプロダクト
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {todaysPicks.slice(0, 3).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onVote={handleVote}
                  className="border-2 border-yellow-200 shadow-yellow-100"
                />
              ))}
            </div>
          </section>
        )}

        {/* 注目のプロダクト */}
        {featuredProducts.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-500" />
                <div>
                  <h2 className="text-2xl font-bold">注目のプロダクト</h2>
                  <p className="text-muted-foreground mt-1">
                    運営が選んだ特に注目すべきプロダクト
                  </p>
                </div>
              </div>
            </div>
            <div className="relative">
              {/* 左側のグラデーション（スクロール時のみ表示） */}
              <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none opacity-0 transition-opacity duration-300" id="scroll-fade-left" />
              
              {/* 右側のグラデーション */}
              <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" id="scroll-fade-right" />
              
              <div 
                className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 scroll-smooth"
                onScroll={(e) => {
                  const element = e.currentTarget;
                  const scrollLeft = element.scrollLeft;
                  const scrollWidth = element.scrollWidth;
                  const clientWidth = element.clientWidth;
                  const isAtStart = scrollLeft < 10;
                  const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10;
                  
                  // 左側のフェード
                  const leftFade = document.getElementById('scroll-fade-left');
                  if (leftFade) {
                    leftFade.style.opacity = isAtStart ? '0' : '1';
                  }
                  
                  // 右側のフェード
                  const rightFade = document.getElementById('scroll-fade-right');
                  if (rightFade) {
                    rightFade.style.opacity = isAtEnd ? '0' : '1';
                  }
                }}
              >
                <div className="flex gap-4 sm:gap-6 w-max pr-8">
                  {featuredProducts.map((product, index) => (
                    <div 
                      key={product.id} 
                      className={`
                        w-[calc(100vw-4rem)] 
                        sm:w-[calc(50vw-2.5rem)] 
                        md:w-[calc(50vw-3rem)] 
                        lg:w-[calc(33.333vw-3rem)] 
                        max-w-md flex-shrink-0
                        ${index === 0 ? 'ml-0' : ''}
                      `}
                    >
                      <ProductCard
                        product={product}
                        onVote={handleVote}
                        className="border-2 border-yellow-200 dark:border-yellow-800 shadow-yellow-100"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <style jsx>{`
                .overflow-x-auto {
                  scrollbar-width: thin;
                  scrollbar-color: #9ca3af #f3f4f6;
                  -webkit-overflow-scrolling: touch;
                }
                .overflow-x-auto::-webkit-scrollbar {
                  height: 8px;
                }
                .overflow-x-auto::-webkit-scrollbar-track {
                  background: #f3f4f6;
                  border-radius: 4px;
                }
                .overflow-x-auto::-webkit-scrollbar-thumb {
                  background: #9ca3af;
                  border-radius: 4px;
                }
                .overflow-x-auto::-webkit-scrollbar-thumb:hover {
                  background: #6b7280;
                }
                @media (prefers-color-scheme: dark) {
                  .overflow-x-auto {
                    scrollbar-color: #4b5563 #1f2937;
                  }
                  .overflow-x-auto::-webkit-scrollbar-track {
                    background: #1f2937;
                  }
                  .overflow-x-auto::-webkit-scrollbar-thumb {
                    background: #4b5563;
                  }
                  .overflow-x-auto::-webkit-scrollbar-thumb:hover {
                    background: #6b7280;
                  }
                }
                /* モバイルでスクロールバーを非表示 */
                @media (max-width: 768px) {
                  .overflow-x-auto::-webkit-scrollbar {
                    display: none;
                  }
                  .overflow-x-auto {
                    scrollbar-width: none;
                  }
                }
              `}</style>
            </div>
          </section>
        )}

        {/* プロダクト一覧 */}
        <section ref={productsRef} className="relative scroll-mt-20">
          {/* カテゴリー変更時の通知バナー */}
          <AnimatePresence>
            {showCategoryChange && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute -top-16 left-0 right-0 z-20"
              >
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-4 shadow-lg flex items-center justify-center gap-2">
                  <Filter className="w-5 h-5" />
                  <span className="font-medium">
                    {categoryDisplayName 
                      ? `「${categoryDisplayName}」カテゴリのプロダクトを表示中`
                      : "すべてのプロダクトを表示中"
                    }
                  </span>
                </div>
              </motion.div>
            )}
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
              {categoryDisplayName 
                ? (
                  <span>
                    カテゴリ: 
                    <Badge variant="outline" className="ml-2 text-lg px-3 py-1">
                      {categoryDisplayName}
                    </Badge>
                  </span>
                )
                : "すべてのプロダクト"
              }
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
                  <CardHeader className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </CardHeader>
                  <CardContent>
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
                    : "プロダクトがありません。"
                  }
                </p>
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
  )
}
