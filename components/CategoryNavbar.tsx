'use client';

import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase-client';
import type { Category } from '@/lib/types/database';

interface CategoryNavbarProps {
  activeCategory?: string | null;
  onCategoryChange?: (categorySlug: string | null) => void;
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

export function CategoryNavbar({ activeCategory, onCategoryChange }: CategoryNavbarProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
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

  return (
    <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3">
          <div className="relative overflow-hidden">
            {/* 左矢印 */}
            <div className={cn(
              "absolute left-0 top-0 bottom-0 flex items-center z-10 bg-gradient-to-r from-white via-white to-transparent pr-2",
              !showLeftArrow && "hidden"
            )}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full shadow-md bg-white hover:bg-gray-100"
                onClick={() => scroll('left')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>

            {/* カテゴリースクロールコンテナ */}
            <div
              ref={scrollContainerRef}
              className="flex items-center space-x-2 overflow-x-auto scrollbar-hide px-1"
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
                  "flex items-center space-x-2 whitespace-nowrap px-4 py-2 rounded-full transition-all flex-shrink-0",
                  activeCategory === null
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105"
                    : "hover:bg-gray-100"
                )}
                onClick={() => onCategoryChange?.(null)}
              >
                <span className="text-lg">🌟</span>
                <span className="font-medium">すべて</span>
              </Button>

              {/* 各カテゴリ */}
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.slug ? 'default' : 'ghost'}
                  className={cn(
                    "flex items-center space-x-2 whitespace-nowrap px-4 py-2 rounded-full transition-all flex-shrink-0",
                    activeCategory === category.slug
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105"
                      : "hover:bg-gray-100"
                  )}
                  onClick={() => onCategoryChange?.(category.slug)}
                >
                  <span className="text-lg">{emojiMap[category.slug] || '📌'}</span>
                  <span className="font-medium">{category.name}</span>
                </Button>
              ))}
            </div>

            {/* 右矢印 */}
            <div className={cn(
              "absolute right-0 top-0 bottom-0 flex items-center z-10 bg-gradient-to-l from-white via-white to-transparent pl-2",
              !showRightArrow && "hidden"
            )}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full shadow-md bg-white hover:bg-gray-100"
                onClick={() => scroll('right')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
