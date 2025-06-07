export type SupportedLanguage = 'en' | 'ja';

export interface TranslationKeys {
  // ナビゲーション
  nav: {
    home: string;
    products: string;
    about: string;
    community: string;
    profile: string;
    settings: string;
    saved: string;
    signIn: string;
    signUp: string;
    signOut: string;
  };
  // ヘッダー
  header: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    submitProduct: string;
    notifications: string;
  };
  // ヒーローセクション
  hero: {
    title1: string;
    title2: string;
    title3: string;
    subtitle: string;
    exploreProducts: string;
    submitIdea: string;
  };
  // プロダクト関連
  product: {
    featured: string;
    new: string;
    trending: string;
    votes: string;
    comments: string;
    views: string;
    launchDate: string;
    category: string;
    tags: string;
    website: string;
    github: string;
    demo: string;
    edit: string;
    delete: string;
    save: string;
    share: string;
    report: string;
  };
  // フィルター・ソート
  filter: {
    all: string;
    category: string;
    tags: string;
    sortBy: string;
    newest: string;
    oldest: string;
    mostVoted: string;
    mostViewed: string;
    featured: string;
  };
  // フォーム
  form: {
    name: string;
    tagline: string;
    description: string;
    productUrl: string;
    githubUrl: string;
    demoUrl: string;
    thumbnailUrl: string;
    category: string;
    tags: string;
    submit: string;
    cancel: string;
    save: string;
    edit: string;
    delete: string;
    required: string;
    optional: string;
  };
  // ユーザー関連
  user: {
    profile: string;
    username: string;
    displayName: string;
    bio: string;
    website: string;
    twitter: string;
    avatar: string;
    followers: string;
    following: string;
    products: string;
    collections: string;
    follow: string;
    unfollow: string;
    editProfile: string;
  };
  // コメント
  comments: {
    title: string;
    add: string;
    reply: string;
    edit: string;
    delete: string;
    edited: string;
    placeholder: string;
    noComments: string;
  };
  // 通知
  notifications: {
    title: string;
    markAllRead: string;
    noNotifications: string;
    newFollower: string;
    newComment: string;
    newVote: string;
    productFeatured: string;
  };
  // コレクション
  collections: {
    title: string;
    create: string;
    edit: string;
    delete: string;
    name: string;
    description: string;
    public: string;
    private: string;
    saveToCollection: string;
    removeFromCollection: string;
    noCollections: string;
  };
  // 一般的なアクション
  actions: {
    submit: string;
    cancel: string;
    save: string;
    edit: string;
    delete: string;
    confirm: string;
    back: string;
    next: string;
    previous: string;
    loading: string;
    error: string;
    success: string;
    retry: string;
  };
  // エラーメッセージ
  errors: {
    generic: string;
    network: string;
    unauthorized: string;
    notFound: string;
    validation: string;
    required: string;
    invalidEmail: string;
    passwordTooShort: string;
  };
  // 成功メッセージ
  success: {
    saved: string;
    updated: string;
    deleted: string;
    created: string;
    submitted: string;
  };
}

// デフォルト言語設定
export function getLanguageFromDomain(): SupportedLanguage {
  if (typeof window === 'undefined') return 'en';
  
  const hostname = window.location.hostname;
  return hostname.startsWith('ja.') ? 'ja' : 'en';
}

// ブラウザの言語設定から推測
export function getBrowserLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') return 'en';
  
  const lang = navigator.language || navigator.languages?.[0] || 'en';
  return lang.startsWith('ja') ? 'ja' : 'en';
}