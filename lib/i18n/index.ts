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
  // プロダクト投稿
  submit: {
    title: string;
    description: string;
    basicInfo: string;
    productName: string;
    tagline: string;
    detailedDescription: string;
    category: string;
    launchDate: string;
    productImages: string;
    maxImages: string;
    imageNote: string;
    links: string;
    productUrl: string;
    githubUrl: string;
    demoUrl: string;
    tags: string;
    addTags: string;
    tagPlaceholder: string;
    tagNote: string;
    selectImage: string;
    submitting: string;
    submit: string;
    cancel: string;
    success: string;
    // フォームエラー
    nameRequired: string;
    taglineRequired: string;
    descriptionRequired: string;
    categoryRequired: string;
    // カテゴリ/画像関連
    loadingCategories: string;
    selectCategory: string;
    imageSizeError: string;
    maxImagesError: string;
    removeImage: string;
    // 認証エラー
    loginRequired: string;
    // アップロードエラー
    imageUploadError: string;
    submitError: string;
  };
  // 設定ページ
  settings: {
    title: string;
    description: string;
    // タブ
    profile: string;
    notifications: string;
    privacy: string;
    // プロフィール設定
    profileInfo: string;
    profileInfoDescription: string;
    changeAvatar: string;
    username: string;
    email: string;
    bio: string;
    website: string;
    twitter: string;
    github: string;
    usernamePlaceholder: string;
    emailPlaceholder: string;
    bioPlaceholder: string;
    websitePlaceholder: string;
    twitterPlaceholder: string;
    githubPlaceholder: string;
    save: string;
    saving: string;
    // 通知設定
    notificationSettings: string;
    notificationSettingsDescription: string;
    emailNotifications: string;
    emailNotificationsDescription: string;
    upvoteNotifications: string;
    upvoteNotificationsDescription: string;
    commentNotifications: string;
    commentNotificationsDescription: string;
    followNotifications: string;
    followNotificationsDescription: string;
    // プライバシー設定
    privacySettings: string;
    privacySettingsDescription: string;
    profilePublic: string;
    profilePublicDescription: string;
    showEmail: string;
    showEmailDescription: string;
    // アカウント削除
    deleteAccount: string;
    deleteAccountDescription: string;
    deleteAccountButton: string;
    // ログアウト
    signOut: string;
    // 成功・エラーメッセージ
    loadingError: string;
    profileSaveSuccess: string;
    profileSaveError: string;
    notificationSaveSuccess: string;
    notificationSaveError: string;
    privacySaveSuccess: string;
    privacySaveError: string;
  };
  // Aboutページ
  about: {
    title: string;
    description: string;
    mission: {
      title: string;
      description: string;
    };
    community: {
      title: string;
      description: string;
    };
    innovation: {
      title: string;
      description: string;
    };
    howItWorks: {
      title: string;
      step1: {
        title: string;
        description: string;
      };
      step2: {
        title: string;
        description: string;
      };
      step3: {
        title: string;
        description: string;
      };
    };
    cta: {
      title: string;
      description: string;
      exploreButton: string;
    };
  };
}

// URLパスから言語を取得
export function getLanguageFromPath(pathname: string): SupportedLanguage {
  if (pathname.startsWith('/ja')) return 'ja';
  return 'en';
}

// デフォルト言語設定（レガシーサポート）
export function getLanguageFromDomain(): SupportedLanguage {
  if (typeof window === 'undefined') return 'en';
  
  const pathname = window.location.pathname;
  return getLanguageFromPath(pathname);
}

// ブラウザの言語設定から推測
export function getBrowserLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') return 'en';
  
  const lang = navigator.language || navigator.languages?.[0] || 'en';
  return lang.startsWith('ja') ? 'ja' : 'en';
}

// 言語に応じたパスを生成
export function getLocalizedPath(path: string, locale: SupportedLanguage): string {
  // ルートパスの場合
  if (path === '/') {
    return locale === 'ja' ? '/ja' : '/';
  }
  
  // 既に言語プレフィックスがある場合は置換
  if (path.startsWith('/ja')) {
    return locale === 'ja' ? path : path.replace('/ja', '') || '/';
  }
  
  // 言語プレフィックスがない場合
  return locale === 'ja' ? `/ja${path}` : path;
}

// 現在のパスから言語プレフィックスを削除
export function removeLocaleFromPath(path: string): string {
  if (path.startsWith('/ja')) {
    return path.replace('/ja', '') || '/';
  }
  return path;
}