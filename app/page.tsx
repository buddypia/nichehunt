import { HomeClient } from "@/app/HomeClient"
import { getAllTrendingProductsEfficiently } from "@/lib/api/products-server"

export default async function HomePage() {
  // 一括で効率的にデータ取得
  const trendingData = await getAllTrendingProductsEfficiently()

  return (
    <HomeClient 
      trendingToday={trendingData.today}
      trendingWeek={trendingData.week}
      trendingMonth={trendingData.month}
    />
  )
}
