import { HomeClient } from "@/app/HomeClient"
import { getAllTrendingProductsEfficiently } from "@/lib/api/products-server"

export default async function LocaleHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  // 一括で効率的にデータ取得（localeフィルタ付き）
  const trendingData = await getAllTrendingProductsEfficiently(locale)

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