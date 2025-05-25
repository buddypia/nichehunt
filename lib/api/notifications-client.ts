import { supabase } from '@/lib/supabase-client';
import { Notification } from '@/lib/types/notification';

export async function getNotificationsClient(userId: string): Promise<Notification[]> {
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
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) {
    console.error('Error fetching unread notification count:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      userId: userId
    });
    return 0;
  }

  return count || 0;
}
