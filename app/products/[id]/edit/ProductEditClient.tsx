'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import type { ProductWithRelations } from '@/lib/types/database'; // Assuming this type includes all necessary fields
import { getCurrentUser } from '@/lib/auth';
import { toast } from 'sonner';
import { updateProduct, type UpdateProductData } from '@/lib/api/products-client'; 

interface ProductEditClientProps {
  product: ProductWithRelations;
}

export function ProductEditClient({ product: initialProduct }: ProductEditClientProps) {
  const router = useRouter();
  const [product, setProduct] = useState(initialProduct);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
      if (user && initialProduct.user_id === user.id) {
        setIsOwner(true);
      } else {
        // If not owner, redirect (though server component should also handle this)
        toast.error('このプロダクトを編集する権限がありません。');
        router.push(`/products/${initialProduct.id}`);
      }
    };
    fetchUser();
  }, [initialProduct, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) {
      toast.error('編集権限がありません。');
      return;
    }
    setIsLoading(true);
    try {
      const productDataToUpdate: UpdateProductData = {
        name: product.name,
        tagline: product.tagline,
        description: product.description,
        product_url: product.product_url || null,
        // Add other fields from product state that match UpdateProductData if they are editable in the form
        // For example:
        // github_url: product.github_url || null,
        // demo_url: product.demo_url || null,
        // category_id: product.category_id || null, // Ensure category_id is part of product state if editable
      };

      const result = await updateProduct(product.id, productDataToUpdate);

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success('プロダクトが更新されました！');
      router.push(`/products/${product.id}`);
      router.refresh(); // To ensure data is fresh on the detail page
    } catch (error: any) {
      console.error('Failed to update product:', error);
      toast.error(`プロダクトの更新に失敗しました: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOwner) {
    // Render minimal UI or null while redirecting or if initial check failed client-side
    return <div className="container mx-auto py-8 text-center">権限を確認中...</div>;
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>プロダクトを編集: {initialProduct.name}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">プロダクト名</Label>
            <Input
              id="name"
              name="name"
              value={product.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tagline">タグライン</Label>
            <Input
              id="tagline"
              name="tagline"
              value={product.tagline}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">説明</Label>
            <Textarea
              id="description"
              name="description"
              value={product.description}
              onChange={handleChange}
              rows={6}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product_url">プロダクトURL</Label>
            <Input
              id="product_url"
              name="product_url"
              type="url"
              value={product.product_url || ''}
              onChange={handleChange}
            />
          </div>
          {/* Add other fields as necessary: github_url, demo_url, category_id, tags, etc. */}
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            キャンセル
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? '更新中...' : '更新を保存'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
