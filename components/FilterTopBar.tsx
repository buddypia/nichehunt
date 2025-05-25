'use client';

import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Sparkles, Clock, TrendingUp, MessageCircle, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase-client';
import type { Category } from '@/lib/types/database';

interface FilterTopBarProps {
  activeCategory?: string | null;
  onCategoryChange?: (categorySlug: string | null) => void;
  sortBy: 'popular' | 'newest' | 'comments' | 'featured';
  onSortChange: (sort: 'popular' | 'newest' | 'comments' | 'featured') => void;
}

// Emoji mapping for categories
const emojiMap: Record<string, string> = {
  'subscription': '📦',
  'marketplace': '🛍️',
  'education': '📚',
  'ai-technology': '🤖',
  'workspace': '🏢',
  'rental-share': '🔄',
  'health-wellness': '💪',
  'food': '🍽️',
  'fintech': '💰',
  'sustainability': '🌱',
  'entertainment': '🎮',
  'healthcare': '🏥'
};

const sortOptions = [
  { value: 'newest', label: '新着順', icon: Clock },
  { value: 'popular', label: '人気順', icon: TrendingUp },
  { value: 'comments', label: 'コメント順', icon: MessageCircle },
  { value: 'featured', label: '注目順', icon: Star }
] as const;

export function FilterTopBar({ activeCategory, onCategoryChange, sortBy, onSortChange }: FilterTopBarProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sortScrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [showSortLeftArrow, setShowSortLeftArrow] = useState(false);
  const [showSortRightArrow, setShowSortRightArrow] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (!error && data) {
      setCategories(data as unknown as Category[]);
    }
  };

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const checkSortScroll = () => {
    if (sortScrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sortScrollContainerRef.current;
      setShowSortLeftArrow(scrollLeft > 0);
      setShowSortRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    checkSortScroll();
    const container = scrollContainerRef.current;
    const sortContainer = sortScrollContainerRef.current;
    
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
    }
    
    if (sortContainer) {
      sortContainer.addEventListener('scroll', checkSortScroll);
      window.addEventListener('resize', checkSortScroll);
    }
    
    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScroll);
      }
      if (sortContainer) {
        sortContainer.removeEventListener('scroll', checkSortScroll);
      }
      window.removeEventListener('resize', checkScroll);
      window.removeEventListener('resize', checkSortScroll);
    };
  }, [categories]);

  const scroll = (direction: 'left' | 'right', container: 'category' | 'sort' = 'category') => {
    const targetContainer = container === 'category' ? scrollContainerRef.current : sortScrollContainerRef.current;
    if (targetContainer) {
      const scrollAmount = 200;
      targetContainer.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="sticky top-16 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 py-3">
          {/* カテゴリースクロールセクション */}
          <div className="flex-1 relative overflow-hidden">
            {/* 左矢印 */}
            <div className={cn(
              "absolute left-0 top-0 bottom-0 flex items-center z-10 bg-gradient-to-r from-white dark:from-gray-900 via-white dark:via-gray-900 to-transparent pr-2",
              !showLeftArrow && "hidden"
            )}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full shadow-md bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => scroll('left')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>

            {/* カテゴリースクロールコンテナ */}
            <div
              ref={scrollContainerRef}
              className="flex items-center gap-2 overflow-x-auto scrollbar-hide px-1"
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              
              {/* すべてカテゴリ */}
              <Button
                variant={activeCategory === null ? 'default' : 'ghost'}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap px-4 py-2 h-9 rounded-full transition-all flex-shrink-0",
                  activeCategory === null
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
                onClick={() => onCategoryChange?.(null)}
              >
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">すべて</span>
              </Button>

              {/* 各カテゴリ */}
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.slug ? 'default' : 'ghost'}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap px-4 py-2 h-9 rounded-full transition-all flex-shrink-0",
                    activeCategory === category.slug
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                  onClick={() => onCategoryChange?.(category.slug)}
                >
                  <span className="text-base">{emojiMap[category.slug] || '📌'}</span>
                  <span className="text-sm font-medium">{category.name}</span>
                </Button>
              ))}
            </div>

            {/* 右矢印 */}
            <div className={cn(
              "absolute right-0 top-0 bottom-0 flex items-center z-10 bg-gradient-to-l from-white dark:from-gray-900 via-white dark:via-gray-900 to-transparent pl-2",
              !showRightArrow && "hidden"
            )}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full shadow-md bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => scroll('right')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 区切り線 */}
          <div className="hidden sm:block w-px h-8 bg-gray-200 dark:bg-gray-700" />

          {/* ソートオプション - スクロール可能 */}
          <div className="hidden sm:block relative overflow-hidden flex-shrink-0" style={{ maxWidth: '320px' }}>
            {/* 左矢印 */}
            <div className={cn(
              "absolute left-0 top-0 bottom-0 flex items-center z-10 bg-gradient-to-r from-white dark:from-gray-900 via-white dark:via-gray-900 to-transparent pr-2",
              !showSortLeftArrow && "hidden"
            )}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full shadow-md bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => scroll('left', 'sort')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>

            {/* ソートスクロールコンテナ */}
            <div
              ref={sortScrollContainerRef}
              className="flex items-center gap-2 overflow-x-auto scrollbar-hide px-1"
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {sortOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Button
                    key={option.value}
                    variant={sortBy === option.value ? 'default' : 'ghost'}
                    size="sm"
                    className={cn(
                      "flex items-center gap-1.5 h-9 px-3 rounded-full transition-all flex-shrink-0 whitespace-nowrap",
                      sortBy === option.value
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                    onClick={() => onSortChange(option.value as typeof sortBy)}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="text-sm font-medium">{option.label}</span>
                  </Button>
                );
              })}
            </div>

            {/* 右矢印 */}
            <div className={cn(
              "absolute right-0 top-0 bottom-0 flex items-center z-10 bg-gradient-to-l from-white dark:from-gray-900 via-white dark:via-gray-900 to-transparent pl-2",
              !showSortRightArrow && "hidden"
            )}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full shadow-md bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => scroll('right', 'sort')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* モバイル用ソートドロップダウン */}
          <div className="sm:hidden flex-shrink-0">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as typeof sortBy)}
              className="px-3 py-2 h-9 text-sm font-medium rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
