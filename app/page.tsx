import { HomeClient } from "@/app/HomeClient"
import { getTrendingProductsEfficiently } from "@/lib/api/products-server"

export default async function HomePage() {
  // 並列で効率的にデータ取得
  const [trendingToday, trendingWeek, trendingMonth] = await Promise.all([
    getTrendingProductsEfficiently('today'),
    getTrendingProductsEfficiently('week'),
    getTrendingProductsEfficiently('month'),
  ])

  return (
    <HomeClient 
      trendingToday={trendingToday}
      trendingWeek={trendingWeek}
      trendingMonth={trendingMonth}
    />
  )
}
