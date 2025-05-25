'use client'

import { useEffect, useState } from 'react'
import { HomeClient } from "@/app/HomeClient"
import { getProducts, getFeaturedProducts, getTodaysPicks } from "@/lib/api/products-client"
import type { ProductWithRelations } from '@/lib/types/database'
import { LoadingScreen } from "@/components/LoadingScreen"
import { AnimatePresence } from "framer-motion"

export default function HomePage() {
  const [productsData, setProductsData] = useState<{
    products: ProductWithRelations[]
    count: number
    page: number
    limit: number
    totalPages: number
  }>({ products: [], count: 0, page: 1, limit: 20, totalPages: 0 })
  const [featuredProducts, setFeaturedProducts] = useState<ProductWithRelations[]>([])
  const [todaysPicks, setTodaysPicks] = useState<ProductWithRelations[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingMessage, setLoadingMessage] = useState("初期化中...")

  useEffect(() => {
    // ローディングメッセージのアニメーション
    const messages = [
      "革新的なアイデアを探索中...",
      "トレンドを分析中...",
      "人気プロダクトを収集中...",
      "データを最適化中...",
      "もうすぐ完了します..."
    ]
    let messageIndex = 0
    const messageInterval = setInterval(() => {
      if (isLoading) {
        setLoadingMessage(messages[Math.min(messageIndex, messages.length - 1)])
        messageIndex++
      }
    }, 800)

    // プログレスバーのアニメーション
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) return prev
        return prev + Math.random() * 15
      })
    }, 200)

    async function loadData() {
      try {
        setLoadingProgress(20)
        const [productsResult, featured, picks] = await Promise.all([
          getProducts({ limit: 20 }),
          getFeaturedProducts(),
          getTodaysPicks(),
        ])
        
        setLoadingProgress(70)
        
        if (!productsResult.error && productsResult.products) {
          setProductsData({
            products: productsResult.products,
            count: productsResult.count,
            page: productsResult.page || 1,
            limit: productsResult.limit || 20,
            totalPages: productsResult.totalPages || 1
          })
        }
        setFeaturedProducts(featured)
        setTodaysPicks(picks)
        setLoadingProgress(100)
        
        // 完了アニメーションのための遅延
        setTimeout(() => {
          setIsLoading(false)
        }, 300)
      } catch (error) {
        console.error('Error loading data:', error)
        setIsLoading(false)
      }
    }

    loadData()

    return () => {
      clearInterval(messageInterval)
      clearInterval(progressInterval)
    }
  }, [])

  if (isLoading) {
    return (
      <AnimatePresence>
        <LoadingScreen 
          loadingProgress={loadingProgress}
          loadingMessage={loadingMessage}
        />
      </AnimatePresence>
    )
  }

  return (
    <HomeClient 
      initialProducts={productsData.products}
      featuredProducts={featuredProducts}
      todaysPicks={todaysPicks}
    />
  )
}
