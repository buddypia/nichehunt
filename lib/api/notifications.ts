import { createClient } from '@/lib/supabase/server';
import { Notification } from '@/lib/types/notification';

export async function getNotifications(userId: string): Promise<Notification[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }

  return data || [];
}

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }

  return true;
}

export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }

  return true;
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const supabase = await createClient();
  
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) {
    console.error('Error fetching unread notification count:', error);
    return 0;
  }

  return count || 0;
}

export async function createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<boolean> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('notifications')
    .insert(notification);

  if (error) {
    console.error('Error creating notification:', error);
    return false;
  }

  return true;
}
