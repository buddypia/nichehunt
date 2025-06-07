import { createClient } from '@/lib/supabase/client';
import { Notification, CreateNotificationInput } from '@/lib/types/notification';
import { SupportedLanguage } from '@/lib/i18n';
import { en } from '@/lib/i18n/translations/en';
import { ja } from '@/lib/i18n/translations/ja';

export async function getNotificationsClient(userId: string): Promise<Notification[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('❌ Error fetching notifications:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      userId: userId
    });
    return [];
  }

  return data || [];
}

export async function markNotificationAsReadClient(notificationId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking notification as read:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    return false;
  }

  return true;
}

export async function markAllNotificationsAsReadClient(userId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) {
    console.error('Error marking all notifications as read:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    return false;
  }

  return true;
}

export async function getUnreadNotificationCountClient(userId: string): Promise<number> {
  const supabase = createClient();
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) {
    console.error('Error fetching unread notification count:', error);
    return 0;
  }

  return count || 0;
}

// Locale対応の通知作成
export async function createNotificationClient(notification: CreateNotificationInput): Promise<boolean> {
  const supabase = createClient();
  
  // title_keyとmessage_keyからフォールバック用のtitleとmessageを生成
  const localizedText = localizeNotification(notification.title_key, notification.message_key, notification.locale as SupportedLanguage, notification.params || {});
  
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: notification.user_id,
      type: notification.type,
      locale: notification.locale,
      title_key: notification.title_key,
      message_key: notification.message_key,
      params: notification.params || {},
      title: localizedText.title,
      message: localizedText.message,
      related_product_id: notification.related_product_id,
      related_user_slug: notification.related_user_slug,
    });

  if (error) {
    console.error('Error creating notification:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    return false;
  }

  return true;
}

// 翻訳キーからローカライズされたテキストを生成
function localizeNotification(
  titleKey: string, 
  messageKey: string, 
  locale: SupportedLanguage, 
  params: Record<string, any>
): { title: string; message: string } {
  const translations = locale === 'ja' ? ja : en;
  
  // title_keyとmessage_keyを使って翻訳を取得
  const title = getTranslationByKey(translations, titleKey, params);
  const message = getTranslationByKey(translations, messageKey, params);
  
  return { title, message };
}

// ネストした翻訳キーから値を取得するヘルパー関数
function getTranslationByKey(translations: any, key: string, params: Record<string, any>): string {
  const keys = key.split('.');
  let value: any = translations;
  
  for (const k of keys) {
    value = value?.[k];
    if (!value) break;
  }
  
  if (typeof value !== 'string') {
    return key; // キーが見つからない場合はキー自体を返す
  }
  
  // パラメータの置換
  let result = value;
  Object.entries(params).forEach(([paramKey, paramValue]) => {
    result = result.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramValue));
  });
  
  return result;
}

// locale対応の通知取得（クライアント側で現在のlocaleで再翻訳）
export async function getLocalizedNotificationsClient(
  userId: string, 
  currentLocale: SupportedLanguage
): Promise<Notification[]> {
  const notifications = await getNotificationsClient(userId);
  
  return notifications.map(notification => {
    // title_keyとmessage_keyがある場合は現在のlocaleで再翻訳
    if (notification.title_key && notification.message_key) {
      const localized = localizeNotification(
        notification.title_key, 
        notification.message_key, 
        currentLocale, 
        notification.params || {}
      );
      
      return {
        ...notification,
        title: localized.title,
        message: localized.message,
        locale: currentLocale
      };
    }
    
    // 従来の通知はそのまま返す
    return notification;
  });
}
