## NicheHunt システム概要

### 1. プロジェクト概要

NicheHunは、ニッチなビジネスモデルを共有・発見できるWebプラットフォームです。ユーザーは新しいビジネスアイデアを投稿し、他のユーザーのアイデアを閲覧・評価できます。

### 2. 技術スタック

#### フロントエンド

- __Next.js 13.5.1__ - Reactベースのフレームワーク
- __React 18__ - UIライブラリ
- __TypeScript__ - 型安全性を提供
- __Tailwind CSS__ - スタイリング
- __Radix UI__ - アクセシブルなUIコンポーネント
- __Lucide React__ - アイコンライブラリ

#### バックエンド・データベース

- __Supabase__ - BaaS（Backend as a Service）

  - PostgreSQLデータベース
  - 認証機能
  - リアルタイムサブスクリプション（無効化設定）

### 3. 主要機能

#### ビジネスモデル管理

- __投稿機能__ - 新しいビジネスモデルの投稿
- __閲覧機能__ - ビジネスモデルの一覧表示・詳細表示
- __カテゴリ分類__ - 13種類のカテゴリで分類
- __検索機能__ - タイトル・説明文での検索
- __ソート機能__ - 人気順、新着順、コメント数順、注目順

#### インタラクション機能

- __投票（Upvote）__ - ビジネスモデルへの評価
- __コメント__ - ディスカッション機能（返信対応）
- __プロフィール__ - ユーザー情報の表示

#### 特殊機能

- __今日の注目ピックアップ__ - 当日投稿されたモデルを優先表示
- __フィーチャード機能__ - 管理者が選定した注目モデル

### 4. データモデル

#### BusinessModel（ビジネスモデル）

```typescript
{
  id: string
  title: string                    // タイトル
  description: string              // 詳細説明
  category: string                 // カテゴリ
  tags: string[]                   // 必要スキル
  upvotes: number                  // 投票数
  comments: number                 // コメント数
  author: {                        // 投稿者情報
    name: string
    avatar: string
    verified: boolean
  }
  revenue: string                  // 収益モデル
  difficulty: 'Easy'|'Medium'|'Hard' // 難易度
  initialInvestment: string        // 初期投資額
  targetMarket: string             // ターゲット市場
  featured: boolean                // 注目フラグ
}
```

### 5. データベーススキーマ
#### Supabase
Project ID: cfagzsizrstgfmzemlfs
Project Name: NicheHunt

#### 主要テーブル

- __profiles__ - ユーザープロフィール
- __business_models__ - ビジネスモデル
- __topics__ - カテゴリ/トピック
- __business_model_topics__ - モデルとトピックの中間テーブル
- __comments__ - コメント
- __upvotes__ - 投票記録
- __collections__ - コレクション機能

### 6. カテゴリ一覧

1. サブスクリプション
2. マーケットプレイス
3. 教育・学習
4. AI・テクノロジー
5. ワークスペース
6. レンタル・シェア
7. ヘルス・ウェルネス
8. フード・飲食
9. フィンテック
10. サステナビリティ
11. エンターテインメント
12. ヘルスケア

### 7. 主要ページ構成

- __/__ - ホームページ（一覧表示）
- __/models/[id]__ - ビジネスモデル詳細
- __/profiles/[id]__ - ユーザープロフィール
- __/categories__ - カテゴリ一覧
- __/ranking__ - ランキング
- __/trending__ - トレンド
- __/community__ - コミュニティ
- __/about__ - サービス紹介
- __/auth/signin__ - ログイン
- __/auth/signup__ - 新規登録

### 8. 特徴的な実装

- __静的エクスポート対応__ - リアルタイム機能を無効化
- __レスポンシブデザイン__ - モバイル対応
- __グラデーション背景__ - 視覚的な魅力
- __スケルトンローディング__ - UX向上
- __エラーハンドリング__ - 適切なエラー処理

このプラットフォームは、起業家やビジネスアイデアを探している人々が、ニッチな市場機会を発見し、コミュニティと共有するための場を提供しています。
