import { HomeClient } from "@/app/HomeClient"
import { 
  getFeaturedProductsEfficiently, 
  getTodaysPicksEfficiently 
} from "@/lib/api/products-server"

export default async function HomePage() {
  // 並列で効率的にデータ取得
  const [featured, picks] = await Promise.all([
    getFeaturedProductsEfficiently(),
    getTodaysPicksEfficiently(),
  ])

  return (
    <HomeClient 
      featuredProducts={featured}
      todaysPicks={picks}
    />
  )
}
