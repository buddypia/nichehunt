'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, Check } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  path: string;
}

const languages: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    path: '', // パスプレフィックスなし
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    path: 'ja', // /ja パスプレフィックス
  },
];

export function LanguageSwitcher() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // クライアントサイドでのみ実行
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      
      // パスから言語を検出（/ja で始まる場合は日本語）
      if (pathname.startsWith('/ja')) {
        setCurrentLanguage(languages[1]); // 日本語
      } else {
        setCurrentLanguage(languages[0]); // 英語
      }
    }
  }, []);

  const switchLanguage = (language: Language) => {
    if (typeof window === 'undefined') return;

    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    const currentHash = window.location.hash;
    
    // 現在のパスから言語プレフィックスを削除
    let basePath = currentPath;
    if (currentPath.startsWith('/ja')) {
      basePath = currentPath.replace('/ja', '') || '/';
    }
    
    // 新しいパスを構築
    let newPath: string;
    if (language.path) {
      // 言語プレフィックスがある場合（日本語）
      newPath = `/${language.path}${basePath === '/' ? '' : basePath}`;
    } else {
      // 言語プレフィックスがない場合（英語）
      newPath = basePath;
    }
    
    // 新しいURLを構築
    const newUrl = `${newPath}${currentSearch}${currentHash}`;
    
    // 新しいURLに遷移
    window.location.href = newUrl;
  };

  // サーバーサイドレンダリング中は何も表示しない
  if (!isClient) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Globe className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">{currentLanguage.nativeName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => switchLanguage(language)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex flex-col">
              <span className="font-medium">{language.nativeName}</span>
              <span className="text-xs text-muted-foreground">{language.name}</span>
            </div>
            {currentLanguage.code === language.code && (
              <Check className="w-4 h-4 text-blue-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
