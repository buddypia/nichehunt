-- テスト用の通知データを追加（現在のユーザー用）
-- この関数は、現在存在するユーザーに対してテスト通知を作成します

DO $$
DECLARE
    user_record RECORD;
    product_record RECORD;
BEGIN
    -- すべてのユーザーに対してテスト通知を作成
    FOR user_record IN SELECT id FROM profiles LIMIT 5
    LOOP
        -- プロダクトを取得
        SELECT id INTO product_record FROM products LIMIT 1;
        
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
        ) ON CONFLICT DO NOTHING;
        
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
        ) ON CONFLICT DO NOTHING;
        
        -- フォロー通知
        INSERT INTO notifications (user_id, type, title, message, related_product_id, related_user_id, is_read, created_at)
        VALUES (
            user_record.id,
            'follow',
            '新しいフォロワー',
            '新しいユーザーがあなたをフォローしました！',
            NULL,
            (SELECT id FROM profiles WHERE id != user_record.id LIMIT 1),
            false,
            NOW() - INTERVAL '30 minutes'
        ) ON CONFLICT DO NOTHING;
        
        -- システム通知（既読）
        INSERT INTO notifications (user_id, type, title, message, related_product_id, related_user_id, is_read, created_at)
        VALUES (
            user_record.id,
            'system',
            'システム通知',
            'NicheHuntへようこそ！プロフィールを完成させて、コミュニティと繋がりましょう。',
            NULL,
            NULL,
            true,
            NOW() - INTERVAL '1 day'
        ) ON CONFLICT DO NOTHING;
    END LOOP;
END $$;

-- 通知テーブルの状態を確認
SELECT 
    n.user_id,
    p.username,
    COUNT(*) as notification_count,
    SUM(CASE WHEN n.is_read = false THEN 1 ELSE 0 END) as unread_count
FROM notifications n
JOIN profiles p ON n.user_id = p.id
GROUP BY n.user_id, p.username
ORDER BY notification_count DESC;
