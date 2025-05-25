-- 現在存在するすべてのユーザーに対して通知を作成する
DO $$
DECLARE
    user_record RECORD;
    product_record RECORD;
    other_user_record RECORD;
BEGIN
    -- すべてのユーザーをループ
    FOR user_record IN SELECT id, username FROM profiles
    LOOP
        -- プロダクトを取得（存在する場合）
        SELECT id INTO product_record FROM products LIMIT 1;
        
        -- 他のユーザーを取得（フォロー通知用）
        SELECT id INTO other_user_record FROM profiles WHERE id != user_record.id LIMIT 1;
        
        -- 既存の通知をチェックして、重複を避ける
        IF NOT EXISTS (
            SELECT 1 FROM notifications 
            WHERE user_id = user_record.id 
            AND type = 'vote' 
            AND created_at > NOW() - INTERVAL '1 hour'
        ) THEN
            -- 投票通知
            INSERT INTO notifications (user_id, type, title, message, related_product_id, related_user_id, is_read, created_at)
            VALUES (
                user_record.id,
                'vote',
                '新しい投票',
                'あなたのプロダクトが投票されました！',
                product_record.id,
                NULL,
                false,
                NOW() - INTERVAL '5 minutes'
            );
            
            -- コメント通知
            INSERT INTO notifications (user_id, type, title, message, related_product_id, related_user_id, is_read, created_at)
            VALUES (
                user_record.id,
                'comment',
                '新しいコメント',
                'あなたのプロダクトに新しいコメントが投稿されました。',
                product_record.id,
                NULL,
                false,
                NOW() - INTERVAL '10 minutes'
            );
            
            -- フォロー通知（他のユーザーが存在する場合）
            IF other_user_record.id IS NOT NULL THEN
                INSERT INTO notifications (user_id, type, title, message, related_product_id, related_user_id, is_read, created_at)
                VALUES (
                    user_record.id,
                    'follow',
                    '新しいフォロワー',
                    '新しいユーザーがあなたをフォローしました！',
                    NULL,
                    other_user_record.id,
                    false,
                    NOW() - INTERVAL '30 minutes'
                );
            END IF;
            
            -- システム通知
            INSERT INTO notifications (user_id, type, title, message, related_product_id, related_user_id, is_read, created_at)
            VALUES (
                user_record.id,
                'system',
                'システム通知',
                'NicheHuntへようこそ！プロフィールを完成させて、コミュニティと繋がりましょう。',
                NULL,
                NULL,
                false,
                NOW() - INTERVAL '1 hour'
            );
            
            -- 返信通知
            INSERT INTO notifications (user_id, type, title, message, related_product_id, related_user_id, is_read, created_at)
            VALUES (
                user_record.id,
                'reply',
                '返信がありました',
                'あなたのコメントに返信がつきました',
                product_record.id,
                other_user_record.id,
                false,
                NOW() - INTERVAL '15 minutes'
            );
        END IF;
    END LOOP;
END $$;

-- 作成された通知の確認
SELECT 
    n.user_id,
    p.username,
    COUNT(*) as notification_count,
    SUM(CASE WHEN n.is_read = false THEN 1 ELSE 0 END) as unread_count
FROM notifications n
JOIN profiles p ON n.user_id = p.id
GROUP BY n.user_id, p.username
ORDER BY p.username;
