import { HomeClient } from "@/app/HomeClient"
import { getAllTrendingProductsEfficiently } from "@/lib/api/products-server"
import { getCountryCode } from "@/lib/utils/country-code"

export default async function HomePage() {
  // 国コードを取得
  const countryCode = await getCountryCode()
  
  // 一括で効率的にデータ取得（国コードフィルタ付き）
  const trendingData = await getAllTrendingProductsEfficiently(countryCode)

  return (
    <HomeClient 
      trendingToday={trendingData.today}
      trendingWeek={trendingData.week}
      trendingMonth={trendingData.month}
      trendingTodayTotal={trendingData.todayTotal}
      trendingWeekTotal={trendingData.weekTotal}
      trendingMonthTotal={trendingData.monthTotal}
    />
  )
}
