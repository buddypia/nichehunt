import ProductsClient from './ProductsClient';
import { getLocale } from '@/lib/utils/locale';

export default async function ProductsPage() {
  // 言語設定を取得
  const locale = await getLocale();
  
  return <ProductsClient locale={locale} />;
}
