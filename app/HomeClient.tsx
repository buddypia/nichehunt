"use client"

import { useState } from "react"
import { Hero } from "@/components/Hero"
import { ProductCard } from "@/components/ProductCard"
import { TrendingUp, Clock, Award } from "lucide-react"
import type { ProductWithRelations } from "@/lib/types/database"
import { SubmitModal } from "@/components/SubmitModal"

interface HomeClientProps {
  trendingToday: ProductWithRelations[]
  trendingWeek: ProductWithRelations[]
  trendingMonth: ProductWithRelations[]
  trendingTodayTotal: number
  trendingWeekTotal: number
  trendingMonthTotal: number
}

export function HomeClient({ 
  trendingToday, 
  trendingWeek, 
  trendingMonth,
  trendingTodayTotal,
  trendingWeekTotal,
  trendingMonthTotal
}: HomeClientProps) {
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

        {/* 今日のトレンド */}
        {trendingToday.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">今日のトレンド</h2>
                <p className="text-gray-600">{trendingTodayTotal}件のビジネスモデルが話題になっています</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingToday.slice(0, 6).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onVote={handleVote}
                />
              ))}
            </div>
          </section>
        )}

        {/* 今週のトレンド */}
        {trendingWeek.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">今週のトレンド</h2>
                <p className="text-gray-600">{trendingWeekTotal}件のビジネスモデルが話題になっています</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingWeek.slice(0, 6).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onVote={handleVote}
                />
              ))}
            </div>
          </section>
        )}

        {/* 今月のトレンド */}
        {trendingMonth.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">今月のトレンド</h2>
                <p className="text-gray-600">{trendingMonthTotal}件のビジネスモデルが話題になっています</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingMonth.slice(0, 6).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onVote={handleVote}
                />
              ))}
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
