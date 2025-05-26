import { HomeClient } from "@/app/HomeClient"
import { 
  getProductsWithRelations, 
  getFeaturedProductsEfficiently, 
  getTodaysPicksEfficiently 
} from "@/lib/api/products-server"

export default async function HomePage() {
  // 並列で効率的にデータ取得
  const [productsResult, featured, picks] = await Promise.all([
    getProductsWithRelations({ limit: 20 }),
    getFeaturedProductsEfficiently(),
    getTodaysPicksEfficiently(),
  ])

  return (
    <HomeClient 
      initialProducts={productsResult.products}
      featuredProducts={featured}
      todaysPicks={picks}
    />
  )
}
