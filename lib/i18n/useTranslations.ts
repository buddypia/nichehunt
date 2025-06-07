'use client';

import { useState, useEffect } from 'react';
import { SupportedLanguage, TranslationKeys, getLanguageFromDomain } from './index';
import { en } from './translations/en';
import { ja } from './translations/ja';

const translations: Record<SupportedLanguage, TranslationKeys> = {
  en,
  ja,
};

export function useTranslations() {
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setLanguage(getLanguageFromDomain());
  }, []);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // フォールバック: 英語の翻訳を試す
        let fallbackValue: any = translations.en;
        for (const fk of keys) {
          if (fallbackValue && typeof fallbackValue === 'object' && fk in fallbackValue) {
            fallbackValue = fallbackValue[fk];
          } else {
            return key; // キーが見つからない場合はキー自体を返す
          }
        }
        return fallbackValue;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return {
    t,
    language,
    isClient,
  };
}

// 型安全なヘルパー関数
export function useTypedTranslations() {
  const { t, language, isClient } = useTranslations();
  
  return {
    t: translations[language] || translations.en,
    language,
    isClient,
    // レガシーサポート用
    translate: t,
  };
}