'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  X, 
  Sparkles, 
  TrendingUp, 
  Clock,
  Filter,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AdvancedSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onCategoryFilter?: (category: string) => void;
  selectedCategory?: string;
}

const popularSearches = [
  'AI', 
  'サブスクリプション', 
  '副業', 
  'エコビジネス',
  'フリーランス',
  'オンライン教育'
];

const recentSearches = [
  'AIチャットボット',
  'レンタルサービス',
  'マーケットプレイス'
];

export function AdvancedSearchBar({ 
  value, 
  onChange, 
  onCategoryFilter,
  selectedCategory 
}: AdvancedSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchValue: string) => {
    setLocalValue(searchValue);
    onChange(searchValue);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div ref={searchRef} className="relative w-full">
      {/* メインの検索バー */}
      <div className="relative">
        <div className="relative bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
          <div className="flex items-center px-3 py-2">
            <Search className={cn(
              "w-4 h-4 transition-colors duration-200",
              isFocused ? "text-blue-500" : "text-gray-400"
            )} />
            
            <input
              type="text"
              placeholder="ビジネスモデルを検索..."
              value={localValue}
              onChange={(e) => {
                const newValue = e.target.value;
                setLocalValue(newValue);
                onChange(newValue); // リアルタイムで親コンポーネントに値を伝える
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(localValue);
                  setShowSuggestions(false);
                }
              }}
              onFocus={() => {
                setIsFocused(true);
                setShowSuggestions(true);
              }}
              onBlur={() => setIsFocused(false)}
              className="flex-1 mx-2 bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-500"
            />
            
            {localValue && (
              <button
                onClick={clearSearch}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                <X className="w-3 h-3 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 検索候補・提案 */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
          >
            {/* 人気の検索 */}
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-3 h-3 text-orange-500" />
                <span className="text-xs font-semibold text-gray-700">人気の検索</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    onClick={() => handleSearch(term)}
                  >
                    <Sparkles className="w-2.5 h-2.5 mr-1 text-yellow-500" />
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* 最近の検索 */}
            {recentSearches.length > 0 && (
              <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span className="text-xs font-semibold text-gray-700">最近の検索</span>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((term) => (
                    <div
                      key={term}
                      className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleSearch(term)}
                    >
                      <Clock className="w-2.5 h-2.5 text-gray-400" />
                      <span className="text-xs text-gray-600">{term}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
