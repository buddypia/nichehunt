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
  subdomain: string;
}

const languages: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    subdomain: '', // サブドメインなし
  },
  {
    code: 'jp',
    name: 'Japanese',
    nativeName: '日本語',
    subdomain: 'ja', // ja.サブドメイン
  },
];

export function LanguageSwitcher() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // クライアントサイドでのみ実行
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      
      // jp/jaサブドメインの検出（ja.example.com, jp.localhost等）
      if (hostname.startsWith('ja.') || hostname.startsWith('jp.')) {
        setCurrentLanguage(languages[1]); // 日本語
      } else {
        setCurrentLanguage(languages[0]); // 英語
      }
    }
  }, []);

  const switchLanguage = (language: Language) => {
    if (typeof window === 'undefined') return;

    const currentHostname = window.location.hostname;
    const currentPort = window.location.port;
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    const currentHash = window.location.hash;
    
    // 新しいホスト名を構築（開発環境・本番環境共通）
    let newHostname: string;
    
    if (language.subdomain) {
      // サブドメインありの場合（日本語）
      if (currentHostname.startsWith('ja.') || currentHostname.startsWith('jp.')) {
        // 既にjp/jaサブドメインがある場合はそのまま
        newHostname = currentHostname;
      } else {
        // サブドメインを追加
        newHostname = `${language.subdomain}.${currentHostname}`;
      }
    } else {
      // サブドメインなしの場合（英語）
      if (currentHostname.startsWith('ja.')) {
        // ja.サブドメインを削除
        newHostname = currentHostname.replace(/^ja\./, '');
      } else if (currentHostname.startsWith('jp.')) {
        // jp.サブドメインを削除
        newHostname = currentHostname.replace(/^jp\./, '');
      } else {
        // 既にサブドメインがない場合はそのまま
        newHostname = currentHostname;
      }
    }

    // URLを構築
    const protocol = window.location.protocol;
    const portString = currentPort ? `:${currentPort}` : '';
    const newUrl = `${protocol}//${newHostname}${portString}${currentPath}${currentSearch}${currentHash}`;
    
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
