## NicheNext システム概要

NicheNextは、ニッチ市場向けのビジネスアイデアを発見・共有するためのWebプラットフォームです。

### 🎯 システムの目的
- 革新的なニッチビジネスモデルの発見と共有
- 起業家コミュニティの形成とアイデア交換
- 次世代ビジネストレンドの創造

### 🛠️ 技術スタック

#### フロントエンド
- **Next.js 15** - React ベースのフルスタックフレームワーク
- **TypeScript** - 型安全性を確保
- **Tailwind CSS** - ユーティリティファーストのCSSフレームワーク
- **Radix UI** - アクセシブルなUIコンポーネントライブラリ
- **Framer Motion** - アニメーションライブラリ

#### バックエンド/データベース
- **Supabase** - PostgreSQLベースのBaaS（Backend as a Service）
  - Supabase Auth（認証）
  - Supabase Database（PostgreSQL）
  - Row Level Security（RLS）によるセキュアなデータアクセス
  - **Supabase MCP** - データベース操作のためのModel Context Protocol

### 📊 データベース構造

12のテーブルで構成される包括的なデータモデル：

1. **ユーザー管理**
   - `profiles` - ユーザープロファイル
   - `follows` - フォロー関係

2. **プロダクト機能**
   - `products` - ビジネスアイデア情報
   - `categories` - カテゴリ分類
   - `tags` - タグ管理
   - `product_tags` - プロダクトタグ関連
   - `product_images` - 画像ギャラリー

3. **エンゲージメント**
   - `votes` - アップボート機能
   - `comments` - ネスト可能なコメント
   - `collections` - キュレーション機能

4. **システム機能**
   - `notifications` - リアルタイム通知

### 🌟 主要機能

1. **プロダクト管理**
   - ビジネスアイデアの投稿・編集
   - カテゴリ・タグによる分類
   - 画像ギャラリー

2. **ソーシャル機能**
   - ユーザープロファイル
   - フォロー・フォロワー機能
   - 投票（アップボート）
   - コメント・返信
   - コレクション作成

3. **探索・発見**
   - カテゴリ別閲覧
   - トレンディング
   - ランキング
   - 詳細検索

4. **通知システム**
   - リアルタイム通知
   - フォロー、コメント、投票の通知

### 🔒 セキュリティ
- Supabase AuthによるJWT認証
- Row Level Security（RLS）によるデータアクセス制御
- セキュアなAPIエンドポイント

### 📁 プロジェクト構造
```
nichenext/
├── app/               # Next.js App Router
├── components/        # UIコンポーネント
├── lib/               # ユーティリティ・API
│   ├── api/          # APIクライアント
│   ├── supabase/     # Supabase設定
│   └── types/        # TypeScript型定義
├── contexts/          # React Context
├── hooks/            # カスタムフック
└── supabase/         # マイグレーション
```

### 重要
データベースを参照して実装する必要のある場合は、Supabase MCPを利用してまずそのデータベースやスキーマを確認し、その後で実装すること。
