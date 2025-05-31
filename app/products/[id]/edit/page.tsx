import React from 'react';
import { ProductEditClient } from './ProductEditClient';
import { fetchProductById } from '@/lib/api/products-detail'; // Corrected import
import { getCurrentUser } from '@/lib/auth'; // To check ownership server-side initially
import { redirect } from 'next/navigation';

interface ProductEditPageProps {
  params: Promise<{ // Ensure params is a Promise
    id: string;
  }>;
}

export default async function ProductEditPage({ params }: ProductEditPageProps) {
  const { id } = await params; // Await params to get id
  const productId = parseInt(id, 10);

  if (isNaN(productId)) {
    return <div className="container mx-auto py-8">無効なプロダクトIDです。</div>;
  }

  const product = await fetchProductById(productId.toString(), true); // Use fetchProductById and pass true
  const currentUser = await getCurrentUser();

  if (!product) {
    return <div className="container mx-auto py-8">プロダクトが見つかりません。</div>;
  }

  if (!currentUser || currentUser.id !== product.user_id) {
    // Optional: Redirect if not owner, or let client component handle finer-grained access control/messaging
    // For now, redirecting to product page
    redirect(`/products/${productId}`);
    // return <div className="container mx-auto py-8">このプロダクトを編集する権限がありません。</div>;
  }
  
  return (
    <div className="container mx-auto py-8">
      <ProductEditClient product={product} />
    </div>
  );
}
