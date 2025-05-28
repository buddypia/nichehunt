-- Insert more test users
INSERT INTO profiles (id, username, display_name, bio, avatar_url, website_url, twitter_handle)
VALUES 
  ('d0a0a0a0-0000-0000-0000-000000000001'::uuid, 'tech_innovator', 'Tech Innovator', 'AI・機械学習エンジニア。革新的なプロダクト開発に情熱を注いでいます。', 'https://api.dicebear.com/6.x/avataaars/svg?seed=tech_innovator', 'https://techinnovator.dev', 'tech_innovator'),
  ('d0a0a0a0-0000-0000-0000-000000000002'::uuid, 'design_master', 'Design Master', 'UIUXデザイナー。美しく使いやすいプロダクトを作ることが使命です。', 'https://api.dicebear.com/6.x/avataaars/svg?seed=design_master', 'https://designmaster.com', 'design_master'),
  ('d0a0a0a0-0000-0000-0000-000000000003'::uuid, 'startup_guru', 'Startup Guru', '連続起業家。10年で5つのスタートアップを立ち上げました。', 'https://api.dicebear.com/6.x/avataaars/svg?seed=startup_guru', 'https://startupguru.io', 'startup_guru'),
  ('d0a0a0a0-0000-0000-0000-000000000004'::uuid, 'code_wizard', 'Code Wizard', 'フルスタックエンジニア。オープンソースに貢献しています。', 'https://api.dicebear.com/6.x/avataaars/svg?seed=code_wizard', 'https://codewizard.dev', 'code_wizard'),
  ('d0a0a0a0-0000-0000-0000-000000000005'::uuid, 'growth_hacker', 'Growth Hacker', 'グロースマーケター。データドリブンな成長戦略を専門としています。', 'https://api.dicebear.com/6.x/avataaars/svg?seed=growth_hacker', 'https://growthhacker.io', 'growth_hacker')
ON CONFLICT (id) DO NOTHING;

-- Insert more products with diverse categories and recent dates
INSERT INTO products (name, tagline, description, product_url, github_url, demo_url, thumbnail_url, user_id, category_id, status, launch_date, is_featured, view_count)
VALUES 
  -- AI/ML カテゴリ (category_id: 1)
  ('AI Resume Builder', '履歴書を自動で最適化するAIツール', 'GPT-4を使用して、職種に最適化された履歴書を自動生成。ATS（採用管理システム）対応で通過率を大幅に向上させます。', 'https://ai-resume-builder.com', 'https://github.com/example/ai-resume', 'https://demo.ai-resume-builder.com', 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800', 'd0a0a0a0-0000-0000-0000-000000000001'::uuid, 1, 'published', CURRENT_DATE - INTERVAL '2 days', false, 450),
  
  ('Smart Meeting Assistant', '会議を自動で要約・タスク抽出するAI', 'リアルタイムで会議内容を文字起こしし、重要なポイントとタスクを自動抽出。Slack/Notionと連携可能。', 'https://smart-meeting.ai', 'https://github.com/example/smart-meeting', 'https://demo.smart-meeting.ai', 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800', 'd0a0a0a0-0000-0000-0000-000000000001'::uuid, 1, 'published', CURRENT_DATE - INTERVAL '5 days', true, 890),
  
  -- 生産性向上 カテゴリ (category_id: 2)
  ('FocusFlow', 'ポモドーロ×AIで最適な集中時間を提案', 'あなたの集中パターンを学習し、最適な作業・休憩時間を提案。Spotifyと連携して集中用プレイリストも自動生成。', 'https://focusflow.app', 'https://github.com/example/focusflow', 'https://demo.focusflow.app', 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800', 'd0a0a0a0-0000-0000-0000-000000000002'::uuid, 2, 'published', CURRENT_DATE - INTERVAL '1 day', false, 1200),
  
  ('TaskMate', 'チームタスクを可視化するダッシュボード', 'GitHubのIssue、TrelloのCard、Asanaのタスクを一元管理。AIが優先度を自動判定。', 'https://taskmate.io', 'https://github.com/example/taskmate', 'https://demo.taskmate.io', 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800', 'd0a0a0a0-0000-0000-0000-000000000003'::uuid, 2, 'published', CURRENT_DATE - INTERVAL '7 days', false, 670),
  
  -- コンテンツ作成 カテゴリ (category_id: 5)
  ('VideoScribe AI', 'YouTube動画の台本を自動生成', 'トレンドと視聴者データを分析して、バズる動画台本を自動生成。サムネイル案も提案。', 'https://videoscribe-ai.com', NULL, 'https://demo.videoscribe-ai.com', 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800', 'd0a0a0a0-0000-0000-0000-000000000004'::uuid, 5, 'published', CURRENT_DATE - INTERVAL '3 days', false, 2300),
  
  ('Blog Optimizer Pro', 'SEO最適化されたブログ記事を生成', 'キーワードリサーチから記事構成、メタデータまで全自動。競合分析機能付き。', 'https://blog-optimizer.pro', 'https://github.com/example/blog-optimizer', NULL, 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800', 'd0a0a0a0-0000-0000-0000-000000000005'::uuid, 5, 'published', CURRENT_DATE - INTERVAL '4 days', true, 1560),
  
  -- 教育・学習 カテゴリ (category_id: 8)
  ('CodeMentor AI', 'AIプログラミング家庭教師', 'コードレビュー、エラー解決、ベストプラクティスの提案をリアルタイムで実施。10言語対応。', 'https://codementor-ai.com', 'https://github.com/example/codementor', 'https://demo.codementor-ai.com', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800', 'd0a0a0a0-0000-0000-0000-000000000001'::uuid, 8, 'published', CURRENT_DATE, false, 3400),
  
  ('Language Lab', '没入型言語学習プラットフォーム', 'VRとAIを組み合わせた革新的な言語学習体験。ネイティブとの会話シミュレーション機能付き。', 'https://language-lab.io', NULL, 'https://demo.language-lab.io', 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800', 'd0a0a0a0-0000-0000-0000-000000000002'::uuid, 8, 'published', CURRENT_DATE - INTERVAL '6 days', false, 980),
  
  -- ヘルスケア カテゴリ (category_id: 9)
  ('MindfulAI', 'パーソナライズされた瞑想アプリ', '心拍変動を分析し、その日の状態に最適な瞑想プログラムを提案。Apple Watchと完全連携。', 'https://mindful-ai.app', NULL, 'https://demo.mindful-ai.app', 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800', 'd0a0a0a0-0000-0000-0000-000000000003'::uuid, 9, 'published', CURRENT_DATE - INTERVAL '2 days', false, 1890),
  
  ('NutriTrack Pro', '写真で栄養管理するアプリ', '食事の写真を撮るだけで、カロリーと栄養素を自動計算。管理栄養士のアドバイス機能付き。', 'https://nutritrack.pro', 'https://github.com/example/nutritrack', NULL, 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800', 'd0a0a0a0-0000-0000-0000-000000000004'::uuid, 9, 'published', CURRENT_DATE - INTERVAL '8 days', true, 2670),
  
  -- フィンテック カテゴリ (category_id: 10)
  ('CryptoPortfolio+', '仮想通貨ポートフォリオ最適化AI', '市場データとあなたのリスク許容度から、最適なポートフォリオを自動構築。税金計算機能付き。', 'https://cryptoportfolio.plus', NULL, 'https://demo.cryptoportfolio.plus', 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800', 'd0a0a0a0-0000-0000-0000-000000000005'::uuid, 10, 'published', CURRENT_DATE - INTERVAL '1 day', false, 4200),
  
  ('BudgetBuddy', '家計簿×投資アドバイスアプリ', '支出を自動カテゴリ分けし、余剰資金の投資先を提案。初心者向けの投資学習コンテンツ付き。', 'https://budgetbuddy.app', 'https://github.com/example/budgetbuddy', 'https://demo.budgetbuddy.app', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800', 'd0a0a0a0-0000-0000-0000-000000000001'::uuid, 10, 'published', CURRENT_DATE - INTERVAL '5 days', false, 1560),
  
  -- ゲーム カテゴリ (category_id: 11)
  ('PixelCraft Studio', 'ブラウザで動くピクセルアート作成ツール', 'ゲーム開発者向けの高機能ピクセルアートエディタ。アニメーション機能とスプライトシート出力対応。', 'https://pixelcraft.studio', 'https://github.com/example/pixelcraft', 'https://demo.pixelcraft.studio', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800', 'd0a0a0a0-0000-0000-0000-000000000002'::uuid, 11, 'published', CURRENT_DATE - INTERVAL '3 days', false, 890),
  
  -- マーケティング カテゴリ (category_id: 6)
  ('SocialPulse', 'SNS投稿の最適タイミングを分析', '複数SNSのエンゲージメントデータを分析し、最適な投稿時間を提案。予約投稿機能付き。', 'https://socialpulse.io', NULL, 'https://demo.socialpulse.io', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800', 'd0a0a0a0-0000-0000-0000-000000000003'::uuid, 6, 'published', CURRENT_DATE - INTERVAL '4 days', true, 3450),
  
  ('EmailGenius', 'AIメールマーケティングツール', 'A/Bテストを自動化し、開封率・クリック率を最大化。パーソナライゼーション機能搭載。', 'https://emailgenius.com', 'https://github.com/example/emailgenius', NULL, 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800', 'd0a0a0a0-0000-0000-0000-000000000004'::uuid, 6, 'published', CURRENT_DATE - INTERVAL '7 days', false, 1230),

  -- 開発ツール カテゴリ (category_id: 3)
  ('API Monitor Pro', 'APIの稼働状況を一元監視', 'REST/GraphQL APIの応答時間、エラー率、使用量を可視化。異常検知とアラート機能付き。', 'https://api-monitor.pro', 'https://github.com/example/api-monitor', NULL, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800', 'd0a0a0a0-0000-0000-0000-000000000005'::uuid, 3, 'published', CURRENT_DATE - INTERVAL '10 days', false, 890),
  
  ('GitFlow Assistant', 'Git操作を自動化するCLIツール', '複雑なGitワークフローを簡単なコマンドで実行。チーム独自のルールも設定可能。', 'https://gitflow-assistant.dev', 'https://github.com/example/gitflow', NULL, 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800', 'd0a0a0a0-0000-0000-0000-000000000001'::uuid, 3, 'published', CURRENT_DATE - INTERVAL '12 days', false, 560),

  -- Eコマース カテゴリ (category_id: 4)
  ('ShopStream', 'ライブコマースプラットフォーム', 'インフルエンサー向けライブ配信×ECの統合プラットフォーム。リアルタイム在庫管理対応。', 'https://shopstream.jp', NULL, 'https://demo.shopstream.jp', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800', 'd0a0a0a0-0000-0000-0000-000000000002'::uuid, 4, 'published', CURRENT_DATE - INTERVAL '9 days', true, 2890),

  -- コミュニティ カテゴリ (category_id: 7)
  ('DevCircle', '開発者向けQ&Aコミュニティ', 'Stack Overflowの日本版。AIが類似質問を提案し、重複を防ぎます。', 'https://devcircle.jp', 'https://github.com/example/devcircle', NULL, 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800', 'd0a0a0a0-0000-0000-0000-000000000003'::uuid, 7, 'published', CURRENT_DATE - INTERVAL '15 days', false, 1670),

  -- その他 カテゴリ (category_id: 12)
  ('EcoTracker', 'カーボンフットプリント計測アプリ', '日常の行動から CO2排出量を自動計算。エコ活動の提案とポイント還元機能付き。', 'https://ecotracker.app', NULL, NULL, 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800', 'd0a0a0a0-0000-0000-0000-000000000004'::uuid, 12, 'published', CURRENT_DATE - INTERVAL '20 days', false, 780);

-- Get the IDs of newly inserted products (assuming they start from ID 23)
-- Add product tags
INSERT INTO product_tags (product_id, tag_id)
SELECT p.id, t.id
FROM products p
CROSS JOIN tags t
WHERE p.name = 'AI Resume Builder' AND t.name IN ('AI', '自動化', 'ツール')
UNION ALL
SELECT p.id, t.id
FROM products p
CROSS JOIN tags t
WHERE p.name = 'Smart Meeting Assistant' AND t.name IN ('AI', '生産性', 'ビジネス')
UNION ALL
SELECT p.id, t.id
FROM products p
CROSS JOIN tags t
WHERE p.name = 'FocusFlow' AND t.name IN ('生産性', 'AI', 'ツール')
UNION ALL
SELECT p.id, t.id
FROM products p
CROSS JOIN tags t
WHERE p.name = 'TaskMate' AND t.name IN ('生産性', 'チーム', 'ダッシュボード')
UNION ALL
SELECT p.id, t.id
FROM products p
CROSS JOIN tags t
WHERE p.name = 'VideoScribe AI' AND t.name IN ('AI', 'コンテンツ', 'YouTube')
UNION ALL
SELECT p.id, t.id
FROM products p
CROSS JOIN tags t
WHERE p.name = 'Blog Optimizer Pro' AND t.name IN ('SEO', 'AI', 'ブログ')
UNION ALL
SELECT p.id, t.id
FROM products p
CROSS JOIN tags t
WHERE p.name = 'CodeMentor AI' AND t.name IN ('AI', '教育', 'プログラミング')
UNION ALL
SELECT p.id, t.id
FROM products p
CROSS JOIN tags t
WHERE p.name = 'Language Lab' AND t.name IN ('教育', 'VR', 'AI')
UNION ALL
SELECT p.id, t.id
FROM products p
CROSS JOIN tags t
WHERE p.name = 'MindfulAI' AND t.name IN ('ヘルスケア', 'AI', 'メンタルヘルス')
UNION ALL
SELECT p.id, t.id
FROM products p
CROSS JOIN tags t
WHERE p.name = 'NutriTrack Pro' AND t.name IN ('ヘルスケア', '栄養', 'AI')
UNION ALL
SELECT p.id, t.id
FROM products p
CROSS JOIN tags t
WHERE p.name = 'CryptoPortfolio+' AND t.name IN ('仮想通貨', 'AI', '投資')
UNION ALL
SELECT p.id, t.id
FROM products p
CROSS JOIN tags t
WHERE p.name = 'BudgetBuddy' AND t.name IN ('家計簿', '投資', 'フィンテック')
UNION ALL
SELECT p.id, t.id
FROM products p
CROSS JOIN tags t
WHERE p.name = 'PixelCraft Studio' AND t.name IN ('ゲーム開発', 'ツール', 'アート')
UNION ALL
SELECT p.id, t.id
FROM products p
CROSS JOIN tags t
WHERE p.name = 'SocialPulse' AND t.name IN ('SNS', 'マーケティング', '分析')
UNION ALL
SELECT p.id, t.id
FROM products p
CROSS JOIN tags t
WHERE p.name = 'EmailGenius' AND t.name IN ('メール', 'マーケティング', 'AI');

-- Add some votes to make products trending
INSERT INTO votes (user_id, product_id)
SELECT 
  u.id,
  p.id
FROM 
  (SELECT id FROM profiles ORDER BY random() LIMIT 5) u
CROSS JOIN 
  (SELECT id FROM products WHERE name IN ('CodeMentor AI', 'CryptoPortfolio+', 'SocialPulse') LIMIT 3) p
ON CONFLICT DO NOTHING;

-- Add more varied votes
INSERT INTO votes (user_id, product_id)
SELECT 
  profiles.id,
  products.id
FROM 
  profiles,
  products
WHERE 
  products.name IN ('Smart Meeting Assistant', 'Blog Optimizer Pro', 'NutriTrack Pro', 'ShopStream')
  AND profiles.username IN ('alice', 'bob', 'charlie')
ON CONFLICT DO NOTHING;

-- Add some comments
INSERT INTO comments (user_id, product_id, content)
VALUES
  ((SELECT id FROM profiles WHERE username = 'alice'), (SELECT id FROM products WHERE name = 'AI Resume Builder'), 'このツールのおかげで書類選考の通過率が上がりました！ATSスコアが表示されるのも便利です。'),
  ((SELECT id FROM profiles WHERE username = 'bob'), (SELECT id FROM products WHERE name = 'CodeMentor AI'), 'エラーメッセージの解説が的確で助かります。初心者にもおすすめできるツールです。'),
  ((SELECT id FROM profiles WHERE username = 'charlie'), (SELECT id FROM products WHERE name = 'FocusFlow'), 'Spotifyとの連携が素晴らしい！集中力が格段に上がりました。'),
  ((SELECT id FROM profiles WHERE username = 'tech_innovator'), (SELECT id FROM products WHERE name = 'CryptoPortfolio+'), 'リスク分析機能が秀逸。投資初心者でも安心して使えます。'),
  ((SELECT id FROM profiles WHERE username = 'design_master'), (SELECT id FROM products WHERE name = 'PixelCraft Studio'), 'プロ仕様の機能が揃っていて感動しました。特にアニメーション機能が使いやすいです。');

-- Add replies to some comments
INSERT INTO comments (user_id, product_id, parent_id, content)
VALUES
  ((SELECT id FROM profiles WHERE username = 'startup_guru'), 
   (SELECT id FROM products WHERE name = 'AI Resume Builder'),
   (SELECT id FROM comments WHERE content LIKE '%ATS%' LIMIT 1),
   '私も使ってみました！職種別のテンプレートが豊富で良いですね。'),
  
  ((SELECT id FROM profiles WHERE username = 'code_wizard'), 
   (SELECT id FROM products WHERE name = 'CodeMentor AI'),
   (SELECT id FROM comments WHERE content LIKE '%初心者%' LIMIT 1),
   'ベストプラクティスの提案機能も素晴らしいですよ。コードの品質が向上しました。');