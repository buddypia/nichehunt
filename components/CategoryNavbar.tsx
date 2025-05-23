'use client';

import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, TrendingUp, Clock, MessageCircle, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SortOption } from '@/components/RankingSort';

interface CategoryNavbarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const categories = [
  { id: 'all', name: 'すべて', emoji: '🌟' },
  { id: 'subscription', name: 'サブスクリプション', emoji: '📦' },
  { id: 'marketplace', name: 'マーケットプレイス', emoji: '🛍️' },
  { id: 'education', name: '教育・学習', emoji: '📚' },
  { id: 'ai', name: 'AI・テクノロジー', emoji: '🤖' },
  { id: 'workspace', name: 'ワークスペース', emoji: '🏢' },
  { id: 'rental', name: 'レンタル・シェア', emoji: '🔄' },
  { id: 'health', name: 'ヘルス・ウェルネス', emoji: '💪' },
  { id: 'food', name: 'フード・飲食', emoji: '🍽️' },
  { id: 'finance', name: 'フィンテック', emoji: '💰' },
  { id: 'sustainability', name: 'サステナビリティ', emoji: '🌱' },
  { id: 'entertainment', name: 'エンターテインメント', emoji: '🎮' },
  { id: 'healthcare', name: 'ヘルスケア', emoji: '🏥' }
];

const sortOptions = [
  { value: 'popular', label: '人気順', icon: TrendingUp },
  { value: 'newest', label: '新着順', icon: Clock },
  { value: 'comments', label: 'コメント順', icon: MessageCircle },
  { value: 'featured', label: '注目順', icon: Star },
];

export function CategoryNavbar({ selectedCategory, onCategoryChange, selectedSort, onSortChange }: CategoryNavbarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const currentSortOption = sortOptions.find(option => option.value === selectedSort);
  const SortIcon = currentSortOption?.icon || TrendingUp;

  return (
    <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          {/* カテゴリーセクション */}
          <div className="relative flex-1 mr-4">
            {/* 左矢印 */}
            <div className={cn(
              "absolute left-0 top-0 bottom-0 flex items-center z-10 bg-gradient-to-r from-white via-white to-transparent pr-4",
              !showLeftArrow && "hidden"
            )}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full shadow-md bg-white"
                onClick={() => scroll('left')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>

            {/* カテゴリースクロールコンテナ */}
            <div
              ref={scrollContainerRef}
              className="flex items-center space-x-2 overflow-x-auto scrollbar-hide px-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'ghost'}
                  className={cn(
                    "flex items-center space-x-2 whitespace-nowrap px-4 py-2 rounded-full transition-all",
                    selectedCategory === category.id
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105"
                      : "hover:bg-gray-100"
                  )}
                  onClick={() => onCategoryChange(category.id)}
                >
                  <span className="text-lg">{category.emoji}</span>
                  <span className="font-medium">{category.name}</span>
                </Button>
              ))}
            </div>

            {/* 右矢印 */}
            <div className={cn(
              "absolute right-0 top-0 bottom-0 flex items-center z-10 bg-gradient-to-l from-white via-white to-transparent pl-4",
              !showRightArrow && "hidden"
            )}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full shadow-md bg-white"
                onClick={() => scroll('right')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* ランキングソートセクション */}
          <div className="flex items-center space-x-2 border-l pl-4">
            <span className="text-sm text-gray-600 hidden sm:inline">ランキング:</span>
            
            {/* デスクトップ版 */}
            <div className="hidden md:flex items-center space-x-2">
              {sortOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Button
                    key={option.value}
                    variant={selectedSort === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onSortChange(option.value as SortOption)}
                    className={cn(
                      "flex items-center space-x-1",
                      selectedSort === option.value && "bg-gradient-to-r from-blue-600 to-purple-600 border-0"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{option.label}</span>
                  </Button>
                );
              })}
            </div>

            {/* モバイル版ドロップダウン */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <SortIcon className="w-4 h-4" />
                    <span>{currentSortOption?.label}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {sortOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => onSortChange(option.value as SortOption)}
                        className="flex items-center space-x-2"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{option.label}</span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
