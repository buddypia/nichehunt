import { getCountryCode } from '@/lib/utils/country-code';
import { getLanguageFromCountryCode, SupportedLanguage, TranslationKeys } from './index';
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
  const countryCode = await getCountryCode();
  const language = getLanguageFromCountryCode(countryCode);
  return translations[language] || translations.en;
}