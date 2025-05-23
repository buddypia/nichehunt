'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: 'all', name: 'すべて', count: 247 },
  { id: 'subscription', name: 'サブスクリプション', count: 45 },
  { id: 'marketplace', name: 'マーケットプレイス', count: 38 },
  { id: 'education', name: '教育・学習', count: 32 },
  { id: 'ai', name: 'AI・テクノロジー', count: 28 },
  { id: 'workspace', name: 'ワークスペース', count: 24 },
  { id: 'rental', name: 'レンタル・シェア', count: 22 },
  { id: 'health', name: 'ヘルス・ウェルネス', count: 18 },
  { id: 'food', name: 'フード・飲食', count: 16 },
  { id: 'finance', name: 'フィンテック', count: 14 },
  { id: 'sustainability', name: 'サステナビリティ', count: 10 }
];

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">カテゴリー</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'ghost'}
            className="w-full justify-between text-left"
            onClick={() => onCategoryChange(category.id)}
          >
            <span>{category.name}</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {category.count}
            </span>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
