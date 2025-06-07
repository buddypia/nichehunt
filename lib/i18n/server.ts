import { getLocale } from '@/lib/utils/locale';
import { SupportedLanguage, TranslationKeys } from './index';
import { en } from './translations/en';
import { ja } from './translations/ja';

const translations: Record<SupportedLanguage, TranslationKeys> = {
  en,
  ja,
};

/**
 * サーバーサイドで翻訳を取得
 */
export async function getServerTranslations(): Promise<TranslationKeys> {
  const locale = await getLocale();
  return translations[locale] || translations.en;
}