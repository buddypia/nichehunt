import { BusinessModel } from '@/types/BusinessModel';

export const businessModels: BusinessModel[] = [
  {
    id: '1',
    title: 'ペット用ARフィットネスアプリ',
    description: 'ペットと飼い主が一緒に運動できるARゲームアプリ。スマホのカメラでペットの動きを認識し、バーチャルな障害物やターゲットを表示。運動不足解消と絆を深める新しい体験を提供。',
    category: 'AI・テクノロジー',
    tags: ['AR', 'ペット', 'フィットネス', 'ゲーミフィケーション'],
    upvotes: 342,
    comments: 28,
    author: {
      name: '田中健太',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
      verified: true
    },
    createdAt: '2024-01-20',
    featured: true,
    revenue: '月額500円/ユーザー',
    difficulty: 'Medium',
    timeToMarket: '3-4ヶ月',
    initialInvestment: '50-100万円',
    targetMarket: 'ペット飼い主（20-40代）',
    image: 'https://images.pexels.com/photos/7210754/pexels-photo-7210754.jpeg?auto=compress&cs=tinysrgb&w=600',
    website: 'https://example.com'
  },
  {
    id: '2',
    title: '地域特化型スキル交換プラットフォーム',
    description: '近所の人同士でスキルを物々交換できるプラットフォーム。料理が得意な人とDIYが得意な人をマッチング。地域コミュニティの活性化と新しい経済圏を創出。',
    category: 'マーケットプレイス',
    tags: ['シェアリングエコノミー', '地域活性化', 'スキルシェア'],
    upvotes: 256,
    comments: 45,
    author: {
      name: '佐藤美咲',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
      verified: false
    },
    createdAt: '2024-01-19',
    featured: false,
    revenue: '取引手数料10%',
    difficulty: 'Easy',
    timeToMarket: '2-3ヶ月',
    initialInvestment: '30-50万円',
    targetMarket: '地域住民（全年齢）',
    image: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    id: '3',
    title: 'AIパーソナルスタイリスト',
    description: '手持ちの服を撮影するだけで、AIが最適なコーディネートを提案。天気や予定に合わせた着こなしアドバイスも。サステナブルファッションの促進にも貢献。',
    category: 'AI・テクノロジー',
    tags: ['AI', 'ファッション', 'サステナブル', 'パーソナライゼーション'],
    upvotes: 189,
    comments: 22,
    author: {
      name: '山田花子',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
      verified: true
    },
    createdAt: '2024-01-18',
    featured: true,
    revenue: '月額980円/ユーザー',
    difficulty: 'Hard',
    timeToMarket: '6-8ヶ月',
    initialInvestment: '200-300万円',
    targetMarket: 'ファッション意識層（20-35歳）',
    image: 'https://images.pexels.com/photos/5886041/pexels-photo-5886041.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    id: '4',
    title: '高齢者向けVR旅行体験サービス',
    description: '移動が困難な高齢者向けに、VRで世界中の観光地を体験できるサービス。思い出の場所への再訪や、行きたかった場所への仮想旅行を提供。',
    category: 'エンターテインメント',
    tags: ['VR', '高齢者', '旅行', 'ウェルビーイング'],
    upvotes: 412,
    comments: 67,
    author: {
      name: '鈴木太郎',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
      verified: false
    },
    createdAt: '2024-01-21',
    featured: false,
    revenue: '月額3,000円/施設',
    difficulty: 'Medium',
    timeToMarket: '4-5ヶ月',
    initialInvestment: '100-150万円',
    targetMarket: '介護施設・高齢者',
    image: 'https://images.pexels.com/photos/3823488/pexels-photo-3823488.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    id: '5',
    title: 'オンライン習い事マッチング',
    description: '子供から大人まで、あらゆる習い事の先生と生徒をマッチング。ピアノ、書道、プログラミングなど幅広いジャンルに対応。レビューシステムで質を担保。',
    category: '教育・学習',
    tags: ['教育', 'マッチング', 'オンライン学習', 'スキルアップ'],
    upvotes: 298,
    comments: 34,
    author: {
      name: '伊藤美穂',
      avatar: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150',
      verified: true
    },
    createdAt: '2024-01-17',
    featured: false,
    revenue: '取引手数料20%',
    difficulty: 'Easy',
    timeToMarket: '2-3ヶ月',
    initialInvestment: '50-80万円',
    targetMarket: '学習意欲のある全年齢',
    image: 'https://images.pexels.com/photos/4145190/pexels-photo-4145190.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    id: '6',
    title: 'サブスク型家庭菜園キット',
    description: '毎月異なる野菜の種と育て方ガイドが届く家庭菜園サービス。初心者でも簡単に始められ、収穫した野菜を使ったレシピも提供。都市部の食育にも貢献。',
    category: 'サブスクリプション',
    tags: ['サブスク', '農業', '食育', 'サステナブル'],
    upvotes: 167,
    comments: 19,
    author: {
      name: '中村健',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
      verified: false
    },
    createdAt: '2024-01-16',
    featured: true,
    revenue: '月額2,980円/ユーザー',
    difficulty: 'Easy',
    timeToMarket: '1-2ヶ月',
    initialInvestment: '30-50万円',
    targetMarket: '都市部ファミリー層',
    image: 'https://images.pexels.com/photos/1105019/pexels-photo-1105019.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    id: '7',
    title: 'AIメンタルヘルスコーチ',
    description: '日々の気分や行動をトラッキングし、AIがパーソナライズされたメンタルヘルスアドバイスを提供。認知行動療法の要素を取り入れた科学的アプローチ。',
    category: 'ヘルスケア',
    tags: ['AI', 'メンタルヘルス', 'ウェルビーイング', 'ヘルステック'],
    upvotes: 523,
    comments: 89,
    author: {
      name: 'takahashi-yumi',
      avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150',
      verified: true
    },
    createdAt: '2024-01-22',
    featured: false,
    revenue: '月額1,500円/ユーザー',
    difficulty: 'Hard',
    timeToMarket: '8-10ヶ月',
    initialInvestment: '300-500万円',
    targetMarket: 'ストレス社会の20-40代',
    image: 'https://images.pexels.com/photos/4101143/pexels-photo-4101143.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    id: '8',
    title: 'ローカルフード宅配サービス',
    description: '地元の小規模飲食店と提携し、大手では扱わない地域の名物料理を宅配。地域経済の活性化と食文化の保存に貢献。',
    category: 'フード・飲食',
    tags: ['フードデリバリー', '地域活性化', 'ローカルビジネス'],
    upvotes: 234,
    comments: 41,
    author: {
      name: '小林誠',
      avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=150',
      verified: false
    },
    createdAt: '2024-01-15',
    featured: false,
    revenue: '配送手数料+15%',
    difficulty: 'Medium',
    timeToMarket: '3-4ヶ月',
    initialInvestment: '100-200万円',
    targetMarket: '地元グルメ愛好家',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600'
  }
];
