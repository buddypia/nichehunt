import { headers } from 'next/headers'

/**
 * リクエストヘッダーから言語を取得する
 */
export async function getLocale(): Promise<string> {
  const headersList = await headers()
  return headersList.get('x-locale') || 'en'
}