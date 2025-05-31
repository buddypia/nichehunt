'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button'; // Button might not be needed directly if using Select
// import { Badge } from '@/components/ui/badge'; // Badge might not be needed
import { 
  Search, 
  X, 
  Sparkles, 
  TrendingUp, 
  Clock,
  // Filter, // Filter icon might be used with Select
  // ChevronDown // ChevronDown is part of Select
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getPopularTags } from '@/lib/api/popular-tags';
import { useSearch } from '@/contexts/SearchContext';
import { fetchCategories } from '@/lib/api/categories-tags';
import { Category } from '@/lib/types/database';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// interface AdvancedSearchBarProps {
//   value: string; // To be removed, will use context
//   onChange: (value: string) => void; // To be removed, will use context
// }

// デフォルトの最近の検索（ローカルストレージから取得するまで）
const defaultRecentSearches = [
  'AIチャットボット',
  'レンタルサービス',
  'マーケットプレイス'
];

export function AdvancedSearchBar() { // Props removed
  const { 
    searchQuery, 
    setSearchQuery, 
    selectedCategory, 
    setSelectedCategory 
  } = useSearch();

  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  // const [localValue, setLocalValue] = useState(searchQuery); // Use searchQuery directly
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>(defaultRecentSearches);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const searchRef = useRef<HTMLDivElement>(null);

  // useEffect(() => { // No longer needed as searchQuery is from context
  //   setLocalValue(searchQuery);
  // }, [searchQuery]);

  // 人気のタグを取得
  useEffect(() => {
    async function fetchPopularTagsData() {
      setIsLoadingTags(true);
      try {
        const tags = await getPopularTags(6);
        setPopularSearches(tags);
      } catch (error) {
        console.error('Failed to fetch popular tags:', error);
        // エラー時はデフォルト値を使用
        setPopularSearches(['AI', 'サブスクリプション', '副業', 'エコビジネス', 'フリーランス', 'オンライン教育']);
      } finally {
        setIsLoadingTags(false);
      }
    }

    fetchPopularTagsData();
  }, []);

  // カテゴリーを取得
  useEffect(() => {
    async function fetchCategoriesData() {
      setIsLoadingCategories(true);
      try {
        const categoriesData = await fetchCategories();
        if (categoriesData.data) {
          setCategories(categoriesData.data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    }
    fetchCategoriesData();
  }, []);

  // 最近の検索履歴をローカルストレージから取得
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      try {
        const parsed = JSON.parse(savedSearches);
        setRecentSearches(parsed.slice(0, 3)); // 最新の3件のみ表示
      } catch (error) {
        console.error('Failed to parse recent searches:', error);
      }
    }
  }, []);

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
    setSearchQuery(searchValue); // Use context setter
    setShowSuggestions(false);

    // 検索履歴に追加（重複を避ける）
    const currentSearches = localStorage.getItem('recentSearches');
    let searches: string[] = [];
    
    if (currentSearches) {
      try {
        searches = JSON.parse(currentSearches);
      } catch (error) {
        console.error('Failed to parse recent searches:', error);
      }
    }

    // 既存の同じ検索を削除して最新を先頭に追加
    searches = searches.filter(s => s !== searchValue);
    searches.unshift(searchValue);
    
    // 最大10件まで保存
    searches = searches.slice(0, 10);
    
    localStorage.setItem('recentSearches', JSON.stringify(searches));
    setRecentSearches(searches.slice(0, 3)); // 表示は3件まで
  };

  const clearSearch = () => {
    setSearchQuery(''); // Use context setter
  };

  return (
    <div ref={searchRef} className="relative w-full">
      {/* メインの検索バー */}
      <div className="relative">
        <div className="relative flex items-center bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
          <div className="flex items-center px-3 py-2 flex-grow">
            <Search className={cn(
              "w-4 h-4 transition-colors duration-200",
              isFocused ? "text-blue-500" : "text-gray-400"
            )} />
            
            <input
              type="text"
              placeholder="ビジネスモデルを検索..."
              value={searchQuery} // Use searchQuery from context
              onChange={(e) => {
                const newValue = e.target.value;
                setSearchQuery(newValue); // Use context setter
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch(searchQuery); // Use searchQuery from context
                  setShowSuggestions(false);
                }
              }}
              onFocus={() => {
                setIsFocused(true);
                setShowSuggestions(true);
              }}
              onBlur={() => setIsFocused(false)} // Consider not hiding suggestions on blur if select is part of suggestions
              className="flex-1 mx-2 bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-500"
            />
            
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3 h-3 text-gray-400" />
              </button>
            )}
          </div>
          {/* Category Selector */}
          <div className="pr-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[150px] h-8 text-xs border-0 bg-transparent focus:ring-0 shadow-none">
                <SelectValue placeholder="カテゴリー" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべてのカテゴリー</SelectItem>
                {isLoadingCategories ? (
                  <SelectItem value="loading" disabled>読み込み中...</SelectItem>
                ) : (
                  categories.map(category => (
                    <SelectItem key={category.id} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
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
                {isLoadingTags ? (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-3 h-3 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                    タグ読み込み中...
                  </div>
                ) : popularSearches.length > 0 ? (
                  popularSearches.map((term) => (
                    <button
                      key={term}
                      className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                      onClick={() => handleSearch(term)}
                    >
                      <Sparkles className="w-2.5 h-2.5 mr-1 text-yellow-500" />
                      {term}
                    </button>
                  ))
                ) : (
                  <span className="text-xs text-gray-500">タグがありません</span>
                )}
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
