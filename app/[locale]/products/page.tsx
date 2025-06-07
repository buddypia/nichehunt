import ProductsClient from '../../products/ProductsClient';

export default async function LocaleProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  return <ProductsClient locale={locale} />;
}