# NicheNext データベースER図

## ER図（Mermaid形式）

```mermaid
erDiagram
    profiles {
        uuid id PK
        varchar username UK
        varchar display_name
        text bio
        text avatar_url
        text website_url
        varchar twitter_handle
        timestamptz created_at
        timestamptz updated_at
    }

    categories {
        int id PK
        varchar name UK
        varchar slug UK
        text description
        varchar icon_name
        timestamptz created_at
    }

    tags {
        int id PK
        varchar name UK
        varchar slug UK
        timestamptz created_at
    }

    products {
        int id PK
        uuid user_id FK
        varchar name
        varchar tagline
        text description
        text product_url
        text github_url
        text demo_url
        text thumbnail_url
        int category_id FK
        varchar status
        date launch_date
        boolean is_featured
        int view_count
        timestamptz created_at
        timestamptz updated_at
    }

    product_tags {
        int product_id PK,FK
        int tag_id PK,FK
    }

    product_images {
        int id PK
        int product_id FK
        text image_url
        text caption
        int display_order
        timestamptz created_at
    }

    votes {
        uuid user_id PK,FK
        int product_id PK,FK
        timestamptz created_at
    }

    comments {
        int id PK
        uuid user_id FK
        int product_id FK
        int parent_id FK
        text content
        boolean is_edited
        timestamptz created_at
        timestamptz updated_at
    }

    collections {
        int id PK
        uuid user_id FK
        varchar name
        text description
        boolean is_public
        timestamptz created_at
        timestamptz updated_at
    }

    collection_products {
        int collection_id PK,FK
        int product_id PK,FK
        timestamptz added_at
    }

    follows {
        uuid follower_id PK,FK
        uuid following_id PK,FK
        timestamptz created_at
    }

    notifications {
        int id PK
        uuid user_id FK
        varchar type
        varchar title
        text message
        int related_product_id FK
        uuid related_user_id FK
        boolean is_read
        timestamptz created_at
    }

    %% リレーションシップ
    profiles ||--o{ products : "creates"
    profiles ||--o{ votes : "votes"
    profiles ||--o{ comments : "writes"
    profiles ||--o{ collections : "owns"
    profiles ||--o{ follows : "follower"
    profiles ||--o{ follows : "following"
    profiles ||--o{ notifications : "receives"
    profiles ||--o{ notifications : "related_user"

    categories ||--o{ products : "categorizes"
    
    tags ||--o{ product_tags : "has"
    products ||--o{ product_tags : "tagged_with"
    products ||--o{ product_images : "has"
    products ||--o{ votes : "receives"
    products ||--o{ comments : "has"
    products ||--o{ collection_products : "included_in"
    products ||--o{ notifications : "related_product"

    collections ||--o{ collection_products : "contains"
    
    comments ||--o{ comments : "has_replies"
```

## テーブル詳細説明

### 1. ユーザー管理
- **profiles**: Supabase Authと連携したユーザープロファイル情報
- **follows**: ユーザー間のフォロー関係を管理

### 2. プロダクト関連
- **products**: メインのプロダクト情報（ニッチなビジネスアイデア）
- **product_images**: プロダクトの画像ギャラリー
- **product_tags**: プロダクトへのタグ付け（多対多）
- **categories**: プロダクトのカテゴリ分類

### 3. エンゲージメント機能
- **votes**: ユーザーのアップボート（投票）機能
- **comments**: ネスト可能なコメント機能（parent_idで返信を実現）
- **collections**: ユーザーが作成するプロダクトのキュレーション

### 4. システム機能
- **notifications**: リアルタイム通知機能
- **tags**: 検索・分類用のタグマスター

## 主要な特徴

1. **Row Level Security (RLS)**: profiles、products、votes、comments、collections、notificationsテーブルでRLSが有効
2. **複合主キー**: product_tags、votes、collection_products、followsテーブルで複合主キーを使用
3. **自己参照**: commentsテーブルのparent_idによるネスト構造
4. **多対多リレーション**: 
   - products ↔ tags（product_tags経由）
   - products ↔ collections（collection_products経由）
   - profiles ↔ profiles（follows経由）

## データベース統計情報
- **総テーブル数**: 12
- **推定レコード数**:
  - profiles: 6件
  - products: 21件
  - categories: 12件
  - tags: 27件
  - product_tags: 84件
  - votes: 26件
  - comments: 25件
  - その他: 各種エンゲージメントデータ

このER図は、NicheNextがニッチ市場向けのプロダクト共有プラットフォームとして、効率的なデータ管理と豊富なソーシャル機能を実現していることを示しています。
