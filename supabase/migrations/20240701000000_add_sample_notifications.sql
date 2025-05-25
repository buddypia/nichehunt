-- サンプル通知データの追加
INSERT INTO notifications (user_id, type, title, message, read, data, created_at)
VALUES 
  -- user_id: 3145c968-f084-4506-8a39-f2abb9cdc69d への通知
  (
    '3145c968-f084-4506-8a39-f2abb9cdc69d',
    'upvote',
    '新しいアップボート',
    'あなたのプロダクト「TaskFlow Pro」がアップボートされました！',
    false,
    jsonb_build_object('product_id', (SELECT id FROM products WHERE name = 'TaskFlow Pro' LIMIT 1)::text, 'voter_id', '11111111-1111-1111-1111-111111111111'),
    NOW() - INTERVAL '5 minutes'
  ),
  (
    '3145c968-f084-4506-8a39-f2abb9cdc69d',
    'comment',
    '新しいコメント',
    'TaskFlow Proに新しいコメントが投稿されました。',
    false,
    jsonb_build_object('product_id', (SELECT id FROM products WHERE name = 'TaskFlow Pro' LIMIT 1)::text, 'user_id', '22222222-2222-2222-2222-222222222222'),
    NOW() - INTERVAL '10 minutes'
  ),
  (
    '3145c968-f084-4506-8a39-f2abb9cdc69d',
    'follow',
    '新しいフォロワー',
    'testuser2があなたをフォローしました！',
    false,
    jsonb_build_object('user_id', '22222222-2222-2222-2222-222222222222'),
    NOW() - INTERVAL '30 minutes'
  ),
  (
    '3145c968-f084-4506-8a39-f2abb9cdc69d',
    'system',
    'システム通知',
    'NicheNextへようこそ！プロフィールを完成させて、コミュニティと繋がりましょう。',
    true,
    NULL,
    NOW() - INTERVAL '1 day'
  ),
  -- テストユーザー1への通知
  (
    '11111111-1111-1111-1111-111111111111',
    'upvote',
    '新しいアップボート',
    'あなたのプロダクト「CodeMentor AI」がアップボートされました！',
    false,
    jsonb_build_object('product_id', (SELECT id FROM products WHERE name = 'CodeMentor AI' LIMIT 1)::text, 'voter_id', '22222222-2222-2222-2222-222222222222'),
    NOW() - INTERVAL '15 minutes'
  ),
  -- テストユーザー2への通知
  (
    '22222222-2222-2222-2222-222222222222',
    'comment',
    '新しいコメント',
    'EcoShareに新しいコメントが投稿されました。',
    false,
    jsonb_build_object('product_id', (SELECT id FROM products WHERE name = 'EcoShare' LIMIT 1)::text, 'user_id', '11111111-1111-1111-1111-111111111111'),
    NOW() - INTERVAL '20 minutes'
  )
ON CONFLICT DO NOTHING;

-- user_id 3145c968-f084-4506-8a39-f2abb9cdc69d のプロファイルが存在しない場合は作成
INSERT INTO profiles (id, username, display_name, bio, avatar_url)
VALUES (
  '3145c968-f084-4506-8a39-f2abb9cdc69d',
  'testuser3',
  'テストユーザー3',
  'NicheNextの新規ユーザーです',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=testuser3'
)
ON CONFLICT (id) DO NOTHING;
