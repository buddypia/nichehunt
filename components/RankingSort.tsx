import React from 'react';
import { Button } from '@/components/ui/button';
import { TrendingUp, Clock, MessageCircle, Star } from 'lucide-react';

export type SortOption = 'popular' | 'newest' | 'comments' | 'featured';

interface RankingSortProps {
  selectedSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export function RankingSort({ selectedSort, onSortChange }: RankingSortProps) {
  const sortOptions: { id: SortOption; label: string; icon: React.ReactNode }[] = [
    { id: 'popular', label: '人気順', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'newest', label: '新着順', icon: <Clock className="w-4 h-4" /> },
    { id: 'comments', label: 'コメント順', icon: <MessageCircle className="w-4 h-4" /> },
    { id: 'featured', label: '注目順', icon: <Star className="w-4 h-4" /> },
  ];

  return (
    <div className="flex items-center space-x-2">
      {sortOptions.map((option) => (
        <Button
          key={option.id}
          variant={selectedSort === option.id ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSortChange(option.id)}
          className="flex items-center space-x-1"
        >
          {option.icon}
          <span>{option.label}</span>
        </Button>
      ))}
    </div>
  );
}
