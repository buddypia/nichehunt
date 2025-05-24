// カテゴリーとemojiのマッピング（クライアント側で使用）
export const categoryEmojis: Record<string, string> = {
  'サブスクリプション': '📦',
  'マーケットプレイス': '🛍️',
  '教育・学習': '📚',
  'AI・テクノロジー': '🤖',
  'ワークスペース': '🏢',
  'レンタル・シェア': '🔄',
  'ヘルス・ウェルネス': '💪',
  'フード・飲食': '🍽️',
  'フィンテック': '💰',
  'サステナビリティ': '🌱',
  'エンターテインメント': '🎮',
  'ヘルスケア': '🏥',
  'その他': '📌'
}

export function getTopicEmoji(topicName: string): string {
  return categoryEmojis[topicName] || '📌'
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
