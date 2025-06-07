-- Fix votes table RLS policies
-- This migration adds missing RLS policies for the votes table

-- votes テーブルが存在しない場合は作成
CREATE TABLE IF NOT EXISTS votes (
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    product_id integer NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT votes_pkey PRIMARY KEY (user_id, product_id)
);

-- RLS が有効でない場合は有効化
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーをドロップ（存在する場合）
DROP POLICY IF EXISTS "Users can view all votes" ON votes;
DROP POLICY IF EXISTS "Users can vote on products" ON votes;
DROP POLICY IF EXISTS "Users can delete their own votes" ON votes;

-- 新しいポリシーを作成
-- 誰でも投票を閲覧可能（プロダクトの投票数表示のため）
CREATE POLICY "Users can view all votes" ON votes
    FOR SELECT
    USING (true);

-- 認証されたユーザーは投票可能
CREATE POLICY "Users can vote on products" ON votes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分の投票を削除可能（投票取り消しのため）
CREATE POLICY "Users can delete their own votes" ON votes
    FOR DELETE
    USING (auth.uid() = user_id);

-- toggle_vote 関数の作成/更新
CREATE OR REPLACE FUNCTION toggle_vote(p_product_id integer)
RETURNS boolean AS $$
DECLARE
    v_user_id uuid;
    v_vote_exists boolean;
BEGIN
    -- 現在のユーザーIDを取得
    v_user_id := auth.uid();
    
    -- ユーザーが認証されていない場合はエラー
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated to vote';
    END IF;
    
    -- 既存の投票を確認
    SELECT EXISTS (
        SELECT 1 FROM votes 
        WHERE user_id = v_user_id AND product_id = p_product_id
    ) INTO v_vote_exists;
    
    IF v_vote_exists THEN
        -- 投票を削除
        DELETE FROM votes 
        WHERE user_id = v_user_id AND product_id = p_product_id;
        RETURN false; -- 投票を削除したことを示す
    ELSE
        -- 投票を追加
        INSERT INTO votes (user_id, product_id) 
        VALUES (v_user_id, p_product_id);
        RETURN true; -- 投票を追加したことを示す
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- インデックスを作成（存在しない場合のみ）
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_product_id ON votes(product_id);
CREATE INDEX IF NOT EXISTS idx_votes_created_at ON votes(created_at DESC);
