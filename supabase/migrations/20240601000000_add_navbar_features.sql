-- notifications テーブルの作成
CREATE TABLE IF NOT EXISTS notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text CHECK (type IN ('upvote', 'comment', 'follow', 'mention', 'system')) NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false NOT NULL,
  data jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- saved_models テーブルの作成
CREATE TABLE IF NOT EXISTS saved_models (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(user_id, product_id)
);

-- user_settings テーブルの作成
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email_notifications boolean DEFAULT true NOT NULL,
  upvote_notifications boolean DEFAULT true NOT NULL,
  comment_notifications boolean DEFAULT true NOT NULL,
  follow_notifications boolean DEFAULT true NOT NULL,
  profile_public boolean DEFAULT true NOT NULL,
  show_email boolean DEFAULT false NOT NULL,
  theme text DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  language text DEFAULT 'ja' CHECK (language IN ('ja', 'en')),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- profilesテーブルに追加カラムを作成
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS twitter text,
  ADD COLUMN IF NOT EXISTS github text;

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_saved_models_user_id ON saved_models(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_models_product_id ON saved_models(product_id);

-- RLS (Row Level Security) ポリシーの設定
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- notifications ポリシー
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- saved_models ポリシー
CREATE POLICY "Users can view their own saved models" ON saved_models
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save models" ON saved_models
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved models" ON saved_models
  FOR DELETE USING (auth.uid() = user_id);

-- user_settings ポリシー
CREATE POLICY "Users can view their own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);

-- 通知作成関数
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_data jsonb DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (p_user_id, p_type, p_title, p_message, p_data);
END;
$$ LANGUAGE plpgsql;

-- 投票時の通知作成トリガー
CREATE OR REPLACE FUNCTION notify_on_vote() RETURNS TRIGGER AS $$
DECLARE
  v_product_author_id uuid;
  v_product_title text;
  v_voter_username text;
BEGIN
  -- 製品の作者IDとタイトルを取得
  SELECT author_id, title INTO v_product_author_id, v_product_title
  FROM products
  WHERE id = NEW.product_id;

  -- 投票者のユーザー名を取得
  SELECT username INTO v_voter_username
  FROM profiles
  WHERE id = NEW.user_id;

  -- 自分の製品への投票は通知しない
  IF v_product_author_id != NEW.user_id THEN
    PERFORM create_notification(
      v_product_author_id,
      'upvote',
      'あなたのプロダクトが投票されました',
      v_voter_username || 'さんが「' || v_product_title || '」に投票しました',
      jsonb_build_object('product_id', NEW.product_id, 'voter_id', NEW.user_id)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_on_vote
  AFTER INSERT ON votes
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_vote();

-- コメント時の通知作成トリガー
CREATE OR REPLACE FUNCTION notify_on_comment() RETURNS TRIGGER AS $$
DECLARE
  v_product_author_id uuid;
  v_product_title text;
  v_commenter_username text;
  v_parent_comment_author_id uuid;
BEGIN
  -- 製品の作者IDとタイトルを取得
  SELECT author_id, title INTO v_product_author_id, v_product_title
  FROM products
  WHERE id = NEW.product_id;

  -- コメント者のユーザー名を取得
  SELECT username INTO v_commenter_username
  FROM profiles
  WHERE id = NEW.author_id;

  -- 製品作者への通知（自分のコメントは除く）
  IF v_product_author_id != NEW.author_id THEN
    PERFORM create_notification(
      v_product_author_id,
      'comment',
      'あなたのプロダクトにコメントがありました',
      v_commenter_username || 'さんが「' || v_product_title || '」にコメントしました',
      jsonb_build_object('product_id', NEW.product_id, 'comment_id', NEW.id)
    );
  END IF;

  -- 返信の場合、親コメントの作者にも通知
  IF NEW.parent_id IS NOT NULL THEN
    SELECT author_id INTO v_parent_comment_author_id
    FROM comments
    WHERE id = NEW.parent_id;

    IF v_parent_comment_author_id != NEW.author_id THEN
      PERFORM create_notification(
        v_parent_comment_author_id,
        'comment',
        'あなたのコメントに返信がありました',
        v_commenter_username || 'さんがあなたのコメントに返信しました',
        jsonb_build_object('product_id', NEW.product_id, 'comment_id', NEW.id)
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_on_comment
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_comment();
