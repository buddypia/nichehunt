/*
  # Seed initial data for NicheHunt

  1. Create initial topics
  2. Create sample profiles
  3. Create sample business models
  4. Link business models to topics
*/

-- Insert initial topics
INSERT INTO public.topics (name, slug, description) VALUES
  ('サブスクリプション', 'subscription', '定期購読型のビジネスモデル'),
  ('マーケットプレイス', 'marketplace', '売り手と買い手をつなぐプラットフォーム'),
  ('教育・学習', 'education', '教育や学習に関するビジネス'),
  ('AI・テクノロジー', 'ai', 'AI技術を活用したビジネス'),
  ('ワークスペース', 'workspace', 'オフィスや作業空間に関するビジネス'),
  ('レンタル・シェア', 'rental', 'レンタルやシェアリングエコノミー'),
  ('ヘルス・ウェルネス', 'health', '健康や福祉に関するビジネス'),
  ('フード・飲食', 'food', '食品や飲食に関するビジネス'),
  ('フィンテック', 'finance', '金融技術を活用したビジネス'),
  ('サステナビリティ', 'sustainability', '持続可能性に焦点を当てたビジネス'),
  ('エンターテインメント', 'entertainment', 'エンターテインメント関連のビジネス'),
  ('ヘルスケア', 'healthcare', '医療・健康管理に関するビジネス')
ON CONFLICT (slug) DO NOTHING;

-- Create sample profiles (these would normally be created via auth signup)
INSERT INTO public.profiles (id, username, avatar_url, bio) VALUES
  ('11111111-1111-1111-1111-111111111111', 'tanaka-kenta', 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150', 'テクノロジーとペットが大好きなエンジニア'),
  ('22222222-2222-2222-2222-222222222222', 'sato-misaki', 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150', 'コミュニティビルダー、シェアリングエコノミー推進者'),
  ('33333333-3333-3333-3333-333333333333', 'yamada-hanako', 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150', 'AIとファッションの融合を目指すデザイナー'),
  ('44444444-4444-4444-4444-444444444444', 'suzuki-taro', 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150', 'VR技術で高齢者の生活を豊かに'),
  ('55555555-5555-5555-5555-555555555555', 'ito-miho', 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150', '教育イノベーター、オンライン学習の専門家'),
  ('66666666-6666-6666-6666-666666666666', 'nakamura-ken', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150', '都市農業とサステナビリティの推進者'),
  ('77777777-7777-7777-7777-777777777777', 'takahashi-yumi', 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150', 'メンタルヘルステックの専門家'),
  ('88888888-8888-8888-8888-888888888888', 'kobayashi-makoto', 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=150', 'ローカルフード愛好家、地域活性化推進者')
ON CONFLICT (username) DO NOTHING;

-- Insert sample business models
INSERT INTO public.business_models (
  submitter_id, name, tagline, description, website_url, thumbnail_url,
  status, target_market, revenue_model, competitive_advantage,
  required_skills, initial_investment_scale, upvote_count, comment_count
) VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'ペット用ARフィットネスアプリ',
    'ペットと飼い主が一緒に楽しめる新しい運動体験',
    'ペットと飼い主が一緒に運動できるARゲームアプリ。スマホのカメラでペットの動きを認識し、バーチャルな障害物やターゲットを表示。運動不足解消と絆を深める新しい体験を提供。',
    'https://example.com',
    'https://images.pexels.com/photos/7210754/pexels-photo-7210754.jpeg?auto=compress&cs=tinysrgb&w=600',
    'published',
    'ペット飼い主（20-40代）',
    '月額500円/ユーザー',
    'ペット専用のAR技術とゲーミフィケーション',
    ARRAY['AR', 'ペット', 'フィットネス', 'ゲーミフィケーション'],
    'medium',
    342,
    28
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '地域特化型スキル交換プラットフォーム',
    '近所の人同士でスキルを物々交換',
    '近所の人同士でスキルを物々交換できるプラットフォーム。料理が得意な人とDIYが得意な人をマッチング。地域コミュニティの活性化と新しい経済圏を創出。',
    NULL,
    'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=600',
    'published',
    '地域住民（全年齢）',
    '取引手数料10%',
    '地域密着型のマッチングアルゴリズム',
    ARRAY['シェアリングエコノミー', '地域活性化', 'スキルシェア'],
    'low',
    256,
    45
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'AIパーソナルスタイリスト',
    'AIがあなたの最適なコーディネートを提案',
    '手持ちの服を撮影するだけで、AIが最適なコーディネートを提案。天気や予定に合わせた着こなしアドバイスも。サステナブルファッションの促進にも貢献。',
    NULL,
    'https://images.pexels.com/photos/5886041/pexels-photo-5886041.jpeg?auto=compress&cs=tinysrgb&w=600',
    'featured',
    'ファッション意識層（20-35歳）',
    '月額980円/ユーザー',
    'AI画像認識とファッション知識の融合',
    ARRAY['AI', 'ファッション', 'サステナブル', 'パーソナライゼーション'],
    'high',
    189,
    22
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    '高齢者向けVR旅行体験サービス',
    'VRで世界中を旅する新しい体験',
    '移動が困難な高齢者向けに、VRで世界中の観光地を体験できるサービス。思い出の場所への再訪や、行きたかった場所への仮想旅行を提供。',
    NULL,
    'https://images.pexels.com/photos/3823488/pexels-photo-3823488.jpeg?auto=compress&cs=tinysrgb&w=600',
    'published',
    '介護施設・高齢者',
    '月額3,000円/施設',
    'シニア向けに最適化されたVR体験',
    ARRAY['VR', '高齢者', '旅行', 'ウェルビーイング'],
    'medium',
    412,
    67
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    'オンライン習い事マッチング',
    'あらゆる習い事の先生と生徒をつなぐ',
    '子供から大人まで、あらゆる習い事の先生と生徒をマッチング。ピアノ、書道、プログラミングなど幅広いジャンルに対応。レビューシステムで質を担保。',
    NULL,
    'https://images.pexels.com/photos/4145190/pexels-photo-4145190.jpeg?auto=compress&cs=tinysrgb&w=600',
    'published',
    '学習意欲のある全年齢',
    '取引手数料20%',
    '幅広いジャンルと質の高い講師陣',
    ARRAY['教育', 'マッチング', 'オンライン学習', 'スキルアップ'],
    'low',
    298,
    34
  ),
  (
    '66666666-6666-6666-6666-666666666666',
    'サブスク型家庭菜園キット',
    '毎月違う野菜を育てる楽しみ',
    '毎月異なる野菜の種と育て方ガイドが届く家庭菜園サービス。初心者でも簡単に始められ、収穫した野菜を使ったレシピも提供。都市部の食育にも貢献。',
    NULL,
    'https://images.pexels.com/photos/1105019/pexels-photo-1105019.jpeg?auto=compress&cs=tinysrgb&w=600',
    'featured',
    '都市部ファミリー層',
    '月額2,980円/ユーザー',
    'キュレーションされた種と詳細なガイド',
    ARRAY['サブスク', '農業', '食育', 'サステナブル'],
    'low',
    167,
    19
  ),
  (
    '77777777-7777-7777-7777-777777777777',
    'AIメンタルヘルスコーチ',
    'AIがあなたのメンタルヘルスをサポート',
    '日々の気分や行動をトラッキングし、AIがパーソナライズされたメンタルヘルスアドバイスを提供。認知行動療法の要素を取り入れた科学的アプローチ。',
    NULL,
    'https://images.pexels.com/photos/4101143/pexels-photo-4101143.jpeg?auto=compress&cs=tinysrgb&w=600',
    'published',
    'ストレス社会の20-40代',
    '月額1,500円/ユーザー',
    '科学的根拠に基づくAIアドバイス',
    ARRAY['AI', 'メンタルヘルス', 'ウェルビーイング', 'ヘルステック'],
    'high',
    523,
    89
  ),
  (
    '88888888-8888-8888-8888-888888888888',
    'ローカルフード宅配サービス',
    '地元の名物料理をお届け',
    '地元の小規模飲食店と提携し、大手では扱わない地域の名物料理を宅配。地域経済の活性化と食文化の保存に貢献。',
    NULL,
    'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600',
    'published',
    '地元グルメ愛好家',
    '配送手数料+15%',
    '地域密着型のネットワーク',
    ARRAY['フードデリバリー', '地域活性化', 'ローカルビジネス'],
    'medium',
    234,
    41
  );

-- Link business models to topics
DO $$
DECLARE
  ai_topic_id UUID;
  marketplace_topic_id UUID;
  education_topic_id UUID;
  entertainment_topic_id UUID;
  healthcare_topic_id UUID;
  subscription_topic_id UUID;
  food_topic_id UUID;
  sustainability_topic_id UUID;
  
  pet_ar_id UUID;
  skill_exchange_id UUID;
  ai_stylist_id UUID;
  vr_travel_id UUID;
  online_lesson_id UUID;
  garden_kit_id UUID;
  mental_health_id UUID;
  local_food_id UUID;
BEGIN
  -- Get topic IDs
  SELECT id INTO ai_topic_id FROM public.topics WHERE slug = 'ai';
  SELECT id INTO marketplace_topic_id FROM public.topics WHERE slug = 'marketplace';
  SELECT id INTO education_topic_id FROM public.topics WHERE slug = 'education';
  SELECT id INTO entertainment_topic_id FROM public.topics WHERE slug = 'entertainment';
  SELECT id INTO healthcare_topic_id FROM public.topics WHERE slug = 'healthcare';
  SELECT id INTO subscription_topic_id FROM public.topics WHERE slug = 'subscription';
  SELECT id INTO food_topic_id FROM public.topics WHERE slug = 'food';
  SELECT id INTO sustainability_topic_id FROM public.topics WHERE slug = 'sustainability';
  
  -- Get business model IDs
  SELECT id INTO pet_ar_id FROM public.business_models WHERE name = 'ペット用ARフィットネスアプリ';
  SELECT id INTO skill_exchange_id FROM public.business_models WHERE name = '地域特化型スキル交換プラットフォーム';
  SELECT id INTO ai_stylist_id FROM public.business_models WHERE name = 'AIパーソナルスタイリスト';
  SELECT id INTO vr_travel_id FROM public.business_models WHERE name = '高齢者向けVR旅行体験サービス';
  SELECT id INTO online_lesson_id FROM public.business_models WHERE name = 'オンライン習い事マッチング';
  SELECT id INTO garden_kit_id FROM public.business_models WHERE name = 'サブスク型家庭菜園キット';
  SELECT id INTO mental_health_id FROM public.business_models WHERE name = 'AIメンタルヘルスコーチ';
  SELECT id INTO local_food_id FROM public.business_models WHERE name = 'ローカルフード宅配サービス';
  
  -- Insert relationships
  INSERT INTO public.business_model_topics (business_model_id, topic_id) VALUES
    (pet_ar_id, ai_topic_id),
    (skill_exchange_id, marketplace_topic_id),
    (ai_stylist_id, ai_topic_id),
    (vr_travel_id, entertainment_topic_id),
    (online_lesson_id, education_topic_id),
    (garden_kit_id, subscription_topic_id),
    (mental_health_id, healthcare_topic_id),
    (local_food_id, food_topic_id)
  ON CONFLICT DO NOTHING;
END $$;
