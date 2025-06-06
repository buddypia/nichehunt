import ProductsClient from './ProductsClient';
import { getCountryCode } from '@/lib/utils/country-code';

export default async function ProductsPage() {
  // 国コードを取得
  const countryCode = await getCountryCode();
  
  return <ProductsClient countryCode={countryCode} />;
}
