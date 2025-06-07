import { ja } from '@/lib/i18n/translations/ja';
import { en } from '@/lib/i18n/translations/en';
import { SupportedLanguage } from '@/lib/i18n';

// カテゴリーとemojiのマッピング（翻訳キーベース）
export const categoryEmojis: Record<string, string> = {
  'subscription': '📦',
  'marketplace': '🛍️',
  'education': '📚',
  'ai': '🤖',
  'workspace': '🏢',
  'rental': '🔄',
  'health': '💪',
  'food': '🍽️',
  'fintech': '💰',
  'sustainability': '🌱',
  'entertainment': '🎮',
  'healthcare': '🏥',
  'other': '📌'
}

// 日本語カテゴリ名から英語キーへのマッピング（既存データ対応）
const jaToKeyMapping: Record<string, string> = {
  'サブスクリプション': 'subscription',
  'マーケットプレイス': 'marketplace',
  '教育・学習': 'education',
  'AI・テクノロジー': 'ai',
  'ワークスペース': 'workspace',
  'レンタル・シェア': 'rental',
  'ヘルス・ウェルネス': 'health',
  'フード・飲食': 'food',
  'フィンテック': 'fintech',
  'サステナビリティ': 'sustainability',
  'エンターテインメント': 'entertainment',
  'ヘルスケア': 'healthcare',
  'その他': 'other'
}

export function getTopicEmoji(topicName: string): string {
  // 日本語の場合はキーに変換
  const key = jaToKeyMapping[topicName] || topicName;
  return categoryEmojis[key] || '📌'
}

// カテゴリ名を翻訳に基づいて取得
export function getCategoryName(categoryKey: string, locale: SupportedLanguage = 'ja'): string {
  const translations = locale === 'ja' ? ja : en;
  const key = jaToKeyMapping[categoryKey] || categoryKey;
  return (translations.categories as any)[key] || categoryKey;
}

// 現在のロケールを取得
function getCurrentLocale(): SupportedLanguage {
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    return pathname.startsWith('/ja') ? 'ja' : pathname.includes('/') && !pathname.startsWith('/ja') ? 'en' : 'ja';
  }
  return 'ja'; // Default to Japanese
}

export interface Topic {
  id: string
  name: string
  slug: string
  description?: string | null
  parent_id?: string | null
  created_at?: string
  updated_at?: string
}
