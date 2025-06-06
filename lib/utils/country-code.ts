import { headers } from 'next/headers'

/**
 * リクエストヘッダーから国コードを取得する
 */
export async function getCountryCode(): Promise<string> {
  const headersList = await headers()
  return headersList.get('x-country-code') || 'en'
}