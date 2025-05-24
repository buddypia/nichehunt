# Supabase プロジェクト スキーマ ER図

```mermaid
erDiagram
    %% ユーザー関連
    auth_users {
        uuid id PK
    }
    
    profiles {
        uuid id PK,FK
        text username UK
        text avatar_url
        text bio
        text website_url
        text location
        text website
        text twitter
        text github
        text linkedin
        text email
        timestamptz created_at
        timestamptz updated_at
    }
    
    %% ビジネスモデル関連
    business_models {
        uuid id PK
        uuid submitter_id FK
        text name
        text tagline
        text description
        text website_url
        text logo_url
        text thumbnail_url
        date launch_date
        text status
        text target_market
        text revenue_model
        text competitive_advantage
        text[] required_skills
        text initial_investment_scale
        int upvote_count
        int comment_count
        timestamptz created_at
        timestamptz updated_at
    }
    
    topics {
        uuid id PK
        text name UK
        text slug UK
        text description
        uuid parent_id FK
        timestamptz created_at
        timestamptz updated_at
    }
    
    business_model_topics {
        uuid business_model_id PK,FK
        uuid topic_id PK,FK
    }
    
    comments {
        uuid id PK
        uuid user_id FK
        uuid business_model_id FK
        uuid parent_comment_id FK
        text content
        timestamptz created_at
        timestamptz updated_at
    }
    
    collections {
        uuid id PK
        uuid user_id FK
        text name
        text description
        bool is_private
        timestamptz created_at
        timestamptz updated_at
    }
    
    collection_items {
        uuid id PK
        uuid collection_id FK
        uuid business_model_id FK
        timestamptz added_at
    }
    
    %% プロダクト関連
    products {
        uuid id PK
        uuid user_id FK
        text title
        text description
        text niche_market
        text monetization_model
        text website_url
        text logo_url
        text status
        int upvote_count
        int comment_count
        timestamptz posted_at
        timestamptz created_at
        timestamptz updated_at
    }
    
    tags {
        int id PK
        text name UK
        text slug UK
        timestamptz created_at
    }
    
    product_tags {
        uuid product_id PK,FK
        int tag_id PK,FK
        timestamptz created_at
    }
    
    categories {
        uuid id PK
        text name UK
        text slug UK
        timestamptz created_at
    }
    
    product_categories {
        uuid product_id PK,FK
        uuid category_id PK,FK
        timestamptz created_at
    }
    
    upvotes {
        uuid user_id PK,FK
        uuid product_id PK,FK
        timestamptz created_at
    }
    
    %% リレーションシップ
    auth_users ||--|| profiles : "has"
    profiles ||--o{ business_models : "submits"
    profiles ||--o{ comments : "writes"
    profiles ||--o{ collections : "creates"
    auth_users ||--o{ products : "creates"
    auth_users ||--o{ upvotes : "gives"
    
    business_models ||--o{ business_model_topics : "has"
    topics ||--o{ business_model_topics : "belongs to"
    topics ||--o{ topics : "has parent"
    
    business_models ||--o{ comments : "receives"
    comments ||--o{ comments : "has replies"
    
    collections ||--o{ collection_items : "contains"
    business_models ||--o{ collection_items : "included in"
    
    products ||--o{ product_tags : "has"
    tags ||--o{ product_tags : "belongs to"
    
    products ||--o{ product_categories : "has"
    categories ||--o{ product_categories : "belongs to"
    
    products ||--o{ upvotes : "receives"
```

## テーブル説明

### ユーザー関連
- **profiles**: ユーザープロフィール情報を格納
- **auth_users**: Supabase認証システムのユーザーテーブル（参照のみ）

### ビジネスモデル関連
- **business_models**: ビジネスモデルの詳細情報を格納するコアテーブル
- **topics**: ビジネスモデルのカテゴリー/トピック（階層構造をサポート）
- **business_model_topics**: ビジネスモデルとトピックを関連付けるジャンクションテーブル
- **comments**: ビジネスモデルに対するユーザーコメント（スレッド形式をサポート）
- **collections**: ユーザーが作成したビジネスモデルのコレクション
- **collection_items**: コレクション内のアイテム（ビジネスモデル）

### プロダクト関連
- **products**: 投稿されたプロダクト情報
- **tags**: プロダクトに付与されるタグ
- **product_tags**: プロダクトとタグの関連付け
- **categories**: プロダクトのカテゴリー
- **product_categories**: プロダクトとカテゴリーの関連付け
- **upvotes**: プロダクトへのお気に入り登録

## 主要な関係性
1. ユーザー（profiles）は複数のビジネスモデルを投稿できる
2. ビジネスモデルは複数のトピックに属することができる
3. コメントは階層構造（返信）をサポート
4. プロダクトは複数のタグとカテゴリーを持つことができる
5. ユーザーはプロダクトにupvote（お気に入り）を付けることができる
