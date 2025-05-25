export interface Notification {
  id: number;
  user_id: string;
  type: 'vote' | 'comment' | 'reply' | 'follow' | 'mention' | 'system';
  title: string;
  message: string | null;
  related_product_id: number | null;
  related_user_id: string | null;
  is_read: boolean;
  created_at: string;
  data?: {
    product_id?: string;
    comment_id?: string;
    voter_id?: string;
    user_id?: string;
    [key: string]: any;
  };
}
