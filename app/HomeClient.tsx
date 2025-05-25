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
  const [topProducts, setTopProducts] = useState<ProductWithRelations[]>([])
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

  useEffect(() => {
    fetchTopProducts()
  }, [])

  const fetchTopProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products_with_stats')
        .select('*')
        .eq('status', 'published' as any)
        .order('vote_count', { ascending: false })
        .limit(5)

      if (error) {
        console.error('Error fetching top products:', error)
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

      setTopProducts(enrichedProducts)
    } catch (error) {
      console.error('Error:', error)
    }
  }

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
        {/* 注目のトップ5 */}
        {topProducts.length > 0 && (
          <section className="mb-16">
            <div className="relative">
              {/* 背景グラデーション */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-orange-600/10 rounded-3xl blur-3xl" />
              
              <div className="relative z-10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Trophy className="w-12 h-12 text-yellow-500" />
                      <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        注目のトップ5
                      </h2>
                      <p className="text-muted-foreground mt-1">
                        最も注目を集めているプロダクト
                      </p>
                    </div>
                  </div>
                  <Link href="/ranking">
                    <Button variant="ghost" className="group">
                      すべて見る
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>

                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className={`relative flex items-center gap-4 p-4 rounded-2xl transition-all hover:scale-[1.02] hover:shadow-xl ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-800' :
                        index === 1 ? 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border border-gray-200 dark:border-gray-700' :
                        index === 2 ? 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800' :
                        'bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {/* ランキング番号 */}
                      <div className="flex-shrink-0">
                        <div className={`relative w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white shadow-lg' :
                          index === 1 ? 'bg-gradient-to-br from-gray-400 to-slate-400 text-white shadow-md' :
                          index === 2 ? 'bg-gradient-to-br from-orange-400 to-amber-400 text-white shadow-md' :
                          'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}>
                          {index + 1}
                          {index === 0 && <Crown className="w-5 h-5 absolute -top-2 -right-1 text-yellow-300" />}
                          {index === 1 && <Medal className="w-4 h-4 absolute -top-1 -right-1 text-gray-300" />}
                          {index === 2 && <Medal className="w-4 h-4 absolute -top-1 -right-1 text-orange-300" />}
                        </div>
                      </div>

                      {/* プロダクト情報 */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${product.id}`} className="group">
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors truncate">
                            {product.name}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {product.tagline}
                          </p>
                        </Link>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {product.category?.name || 'その他'}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Users className="w-3 h-3" />
                            <span>{product.vote_count || 0}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MessageCircle className="w-3 h-3" />
                            <span>{product.comment_count || 0}</span>
                          </div>
                        </div>
                      </div>

                      {/* 投票ボタン */}
                      <div className="flex-shrink-0">
                        <Button
                          onClick={() => handleVote(product.id)}
                          variant={product.has_voted ? "default" : "outline"}
                          size="sm"
                          className="min-w-[80px]"
                        >
                          <TrendingUp className="w-4 h-4 mr-1" />
                          {product.vote_count || 0}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

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
              <div>
                <h2 className="text-2xl font-bold">注目のプロダクト</h2>
                <p className="text-muted-foreground mt-1">
                  運営が選んだ特に注目すべきプロダクト
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onVote={handleVote}
                  className="border-primary/20"
                />
              ))}
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
