-- カテゴリの初期データ
INSERT INTO categories (name, slug, description, icon_name) VALUES
  ('サブスクリプション', 'subscription', '定期購読型のビジネスモデル', 'package'),
  ('マーケットプレイス', 'marketplace', '売り手と買い手をつなぐプラットフォーム', 'shopping-cart'),
  ('教育・学習', 'education', 'オンライン学習や教育関連のサービス', 'book-open'),
  ('AI・テクノロジー', 'ai-technology', 'AI技術を活用したサービス', 'cpu'),
  ('ワークスペース', 'workspace', 'オフィスやコワーキングスペース関連', 'building'),
  ('レンタル・シェア', 'rental-share', 'シェアリングエコノミー関連のサービス', 'refresh-cw'),
  ('ヘルス・ウェルネス', 'health-wellness', '健康や美容に関するサービス', 'heart'),
  ('フード・飲食', 'food', '食品や飲食関連のサービス', 'utensils'),
  ('フィンテック', 'fintech', '金融技術を活用したサービス', 'dollar-sign'),
  ('サステナビリティ', 'sustainability', '環境や持続可能性に関するサービス', 'leaf'),
  ('エンターテインメント', 'entertainment', 'ゲームや娯楽関連のサービス', 'gamepad'),
  ('ヘルスケア', 'healthcare', '医療や健康管理に関するサービス', 'activity')
ON CONFLICT (slug) DO NOTHING;

-- タグの初期データ
INSERT INTO tags (name, slug) VALUES
  ('React', 'react'),
  ('Next.js', 'nextjs'),
  ('TypeScript', 'typescript'),
  ('Supabase', 'supabase'),
  ('Tailwind CSS', 'tailwindcss'),
  ('Node.js', 'nodejs'),
  ('Python', 'python'),
  ('Machine Learning', 'machine-learning'),
  ('Web3', 'web3'),
  ('モバイルアプリ', 'mobile-app'),
  ('SaaS', 'saas'),
  ('API', 'api'),
  ('NoCode', 'nocode'),
  ('スタートアップ', 'startup'),
  ('個人開発', 'indie-dev')
ON CONFLICT (slug) DO NOTHING;

-- テストユーザーの作成（実際の運用では不要）
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'test1@example.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
  ('22222222-2222-2222-2222-222222222222', 'test2@example.com', crypt('password123', gen_salt('bf')), now(), now(), now())
ON CONFLICT (id) DO NOTHING;

-- プロファイルの作成
INSERT INTO profiles (id, username, display_name, bio, avatar_url)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'testuser1', 'テストユーザー1', 'プロダクト開発が大好きです', 'https://api.dicebear.com/7.x/avataaars/svg?seed=testuser1'),
  ('22222222-2222-2222-2222-222222222222', 'testuser2', 'テストユーザー2', 'スタートアップ創業者です', 'https://api.dicebear.com/7.x/avataaars/svg?seed=testuser2')
ON CONFLICT (id) DO NOTHING;

-- サンプルプロダクトの作成
INSERT INTO products (user_id, name, tagline, description, category_id, status, is_featured, launch_date)
VALUES 
  (
    '11111111-1111-1111-1111-111111111111',
    'TaskFlow Pro',
    'AIが自動でタスクを整理・優先順位付けする次世代タスク管理ツール',
    'TaskFlow Proは、機械学習を活用してあなたのタスクを自動的に整理し、最適な優先順位を提案する革新的なタスク管理ツールです。忙しいプロフェッショナルやチームのために設計されており、生産性を最大化します。',
    (SELECT id FROM categories WHERE slug = 'ai-technology'),
    'published',
    true,
    CURRENT_DATE
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'EcoShare',
    '地域コミュニティで物品をシェアできるサステナブルなプラットフォーム',
    'EcoShareは、地域住民が使わなくなった物品を簡単にシェアできるプラットフォームです。環境に優しく、コミュニティのつながりも深まります。',
    (SELECT id FROM categories WHERE slug = 'rental-share'),
    'published',
    false,
    CURRENT_DATE - INTERVAL '1 day'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'CodeMentor AI',
    'プログラミング学習をAIがパーソナライズサポート',
    'CodeMentor AIは、学習者のレベルと目標に合わせてカスタマイズされたプログラミング学習体験を提供します。リアルタイムのコードレビューと個別指導で、効率的にスキルアップできます。',
    (SELECT id FROM categories WHERE slug = 'education'),
    'published',
    true,
    CURRENT_DATE
  )
ON CONFLICT DO NOTHING;

-- プロダクトタグの関連付け
INSERT INTO product_tags (product_id, tag_id)
SELECT p.id, t.id
FROM products p
CROSS JOIN tags t
WHERE 
  (p.name = 'TaskFlow Pro' AND t.slug IN ('react', 'typescript', 'supabase', 'saas'))
  OR (p.name = 'EcoShare' AND t.slug IN ('mobile-app', 'startup', 'web3'))
  OR (p.name = 'CodeMentor AI' AND t.slug IN ('machine-learning', 'python', 'api', 'saas'))
ON CONFLICT DO NOTHING;

-- サンプル投票
INSERT INTO votes (user_id, product_id)
SELECT '11111111-1111-1111-1111-111111111111', id FROM products WHERE name = 'EcoShare'
UNION ALL
SELECT '22222222-2222-2222-2222-222222222222', id FROM products WHERE name = 'TaskFlow Pro'
UNION ALL
SELECT '22222222-2222-2222-2222-222222222222', id FROM products WHERE name = 'CodeMentor AI'
ON CONFLICT DO NOTHING;

-- サンプルコメント
INSERT INTO comments (user_id, product_id, content)
SELECT 
  '22222222-2222-2222-2222-222222222222',
  (SELECT id FROM products WHERE name = 'TaskFlow Pro'),
  'このツールのおかげで生産性が30%向上しました！AIの提案が的確です。'
UNION ALL
SELECT 
  '11111111-1111-1111-1111-111111111111',
  (SELECT id FROM products WHERE name = 'EcoShare'),
  '地域のつながりが深まって素晴らしいアイデアだと思います。'
ON CONFLICT DO NOTHING;
