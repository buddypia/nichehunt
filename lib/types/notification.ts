export interface Notification {
  id: number;
  user_id: string;
  type: 'vote' | 'comment' | 'reply' | 'follow' | 'mention' | 'system' | 'collection' | 'featured';
  title: string;
  message: string | null;
  related_product_id: number | null;
  related_user_slug: string | null;
  is_read: boolean;
  created_at: string;
  // Locale support fields
  locale: string;
  title_key: string | null;
  message_key: string | null;
  params: Record<string, any>;
  data?: {
    product_id?: string;
    comment_id?: string;
    voter_id?: string;
    user_id?: string;
    [key: string]: any;
  };
}

// Utility type for creating notifications with locale support
export interface CreateNotificationInput {
  user_id: string;
  type: Notification['type'];
  locale: string;
  title_key: string;
  message_key: string;
  params?: Record<string, any>;
  related_product_id?: number;
  related_user_slug?: string;
  // Legacy fields for backward compatibility
  title?: string;
  message?: string;
}
