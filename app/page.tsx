'use client'

import { useEffect, useState } from 'react'
import { HomeClient } from "@/app/HomeClient"
import { getProducts, getFeaturedProducts, getTodaysPicks } from "@/lib/api/products-client"
import type { ProductWithRelations } from '@/lib/types/database'

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

  useEffect(() => {
    async function loadData() {
      try {
        const [productsResult, featured, picks] = await Promise.all([
          getProducts({ limit: 20 }),
          getFeaturedProducts(),
          getTodaysPicks(),
        ])
        
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
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <HomeClient 
      initialProducts={productsData.products}
      featuredProducts={featuredProducts}
      todaysPicks={todaysPicks}
    />
  )
}
