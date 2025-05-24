'use client';

import { motion } from 'framer-motion';
import { Search, TrendingUp, Star, MessageCircle } from 'lucide-react';

interface SearchStatsProps {
  query: string;
  resultCount: number;
  topCategory?: string;
  avgUpvotes?: number;
  avgComments?: number;
}

export function SearchStats({ 
  query, 
  resultCount, 
  topCategory,
  avgUpvotes = 0,
  avgComments = 0
}: SearchStatsProps) {
  if (!query) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6 border border-blue-100"
    >
      <div className="flex items-center gap-2 mb-4">
        <Search className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          「{query}」の検索結果
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* 検索結果数 */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {resultCount}
          </div>
          <div className="text-sm text-gray-600">件のビジネスモデル</div>
        </div>
        
        {/* トップカテゴリ */}
        {topCategory && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              <div className="text-sm text-gray-600">トップカテゴリ</div>
            </div>
            <div className="font-semibold text-gray-900">{topCategory}</div>
          </div>
        )}
        
        {/* 平均投票数 */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <div className="text-sm text-gray-600">平均投票数</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {Math.round(avgUpvotes)}
          </div>
        </div>
        
        {/* 平均コメント数 */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-4 h-4 text-green-500" />
            <div className="text-sm text-gray-600">平均コメント数</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {Math.round(avgComments)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
