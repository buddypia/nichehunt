# テストガイド

このプロジェクトでは、Jest と React Testing Library を使用してテストを実行しています。

## セットアップ

テストに必要な依存関係は既に `package.json` に含まれています：

- `jest`: テストフレームワーク
- `@testing-library/react`: React コンポーネントテスト用
- `@testing-library/jest-dom`: Jest 用追加マッチャー
- `@testing-library/user-event`: ユーザーイベントシミュレーション
- `jest-environment-jsdom`: ブラウザ環境のシミュレーション

## テスト実行

```bash
# 全てのテストを実行
npm test

# ウォッチモードでテストを実行
npm run test:watch

# カバレッジレポート付きでテストを実行
npm run test:coverage
```

## テストファイル構成

```
__tests__/
├── components/
│   └── ProductCard.test.tsx     # ProductCard コンポーネントのテスト
└── lib/
    ├── api/
    │   └── products-client.test.ts  # products API のテスト
    ├── auth.test.ts                 # 認証関数のテスト
    └── utils.test.ts                # ユーティリティ関数のテスト
```

## モック設定

### Supabase クライアント
Supabase クライアントは自動的にモックされ、以下の機能をシミュレートします：
- 認証状態の管理
- データベースクエリ
- RPC 関数呼び出し

### Next.js ルーター
Next.js の `useRouter` フックはモックされ、ナビゲーション機能をテストできます。

### 翻訳
国際化（i18n）機能はモックされ、テスト中に翻訳キーが返されます。

## テストカバレッジ

現在のテストは以下の領域をカバーしています：

### コンポーネント
- **ProductCard**: プロダクト表示、投票機能、コレクション保存機能
  - プロダクト情報の表示
  - 投票ボタンの動作
  - バッジ表示（新規、人気、注目）
  - ランキングバッジ
  - 認証されていないユーザーの処理

### API 関数
- **products-client**: プロダクト関連の CRUD 操作
  - プロダクト一覧取得（フィルタリング、ソート、検索）
  - 単一プロダクト取得
  - プロダクト更新・削除（権限チェック付き）
  - 投票機能
  - 特別なプロダクトリスト（今日のピック、注目、トレンディング）

### 認証
- **auth**: ユーザー認証とプロファイル管理
  - サインアップ（ユーザー名重複チェック付き）
  - サインイン（エラーハンドリング付き）
  - Google OAuth サインイン
  - サインアウト
  - 現在のユーザー取得（プロファイル自動作成付き）
  - 認証状態確認

### ユーティリティ
- **utils**: 汎用ヘルパー関数
  - `cn`: Tailwind CSS クラス名マージ
  - `formatDate`: 多言語対応日付フォーマット
  - `formatRelativeTime`: 相対時間表示

## テスト作成のベストプラクティス

1. **明確なテスト名**: テストが何を検証するのかを明確に表現
2. **モックの分離**: 各テストファイルで必要なモックのみを使用
3. **エラーケースのテスト**: 正常系だけでなく異常系もテスト
4. **ユーザー中心のテスト**: 実際のユーザー操作をシミュレート
5. **実装の詳細に依存しない**: UIの変更に強いテストを作成

## 今後の拡張

- E2E テスト（Playwright や Cypress）
- パフォーマンステスト
- アクセシビリティテスト
- 視覚的回帰テスト

## 依存関係の更新

テスト依存関係を最新に保つため、定期的に以下を実行してください：

```bash
npm update @testing-library/react @testing-library/jest-dom @testing-library/user-event jest
```