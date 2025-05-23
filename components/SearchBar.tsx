'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Input
        type="text"
        placeholder="ビジネスモデルを検索..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
  );
}
