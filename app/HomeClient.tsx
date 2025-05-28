"use client"

import { useState } from "react"
import { Hero } from "@/components/Hero"
import { ProductCard } from "@/components/ProductCard"
import { Star, Sparkles } from "lucide-react"
import type { ProductWithRelations } from "@/lib/types/database"
import { SubmitModal } from "@/components/SubmitModal"

interface HomeClientProps {
  featuredProducts: ProductWithRelations[]
  todaysPicks: ProductWithRelations[]
}

export function HomeClient({ featuredProducts, todaysPicks }: HomeClientProps) {
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)

  const handleVote = (productId: number) => {
    // 投票機能の実装（必要に応じて後で実装）
    console.log('Vote for product:', productId)
  }

  const handleSubmitClick = () => {
    setIsSubmitModalOpen(true)
  }

  return (
    <main className="min-h-screen">
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
      </div>
      
      {/* 投稿モーダル */}
      <SubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
      />
    </main>
  )
}
