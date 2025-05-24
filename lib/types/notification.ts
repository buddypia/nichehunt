export interface Notification {
  id: string;
  user_id: string;
  type: 'upvote' | 'comment' | 'follow' | 'mention' | 'system';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  data?: {
    product_id?: string;
    comment_id?: string;
    user_id?: string;
    [key: string]: any;
  };
}
