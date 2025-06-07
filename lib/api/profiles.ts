import { createClient } from '@/lib/supabase/client';
import { ja } from '@/lib/i18n/translations/ja';
import { en } from '@/lib/i18n/translations/en';
import { SupportedLanguage } from '@/lib/i18n';

// Get translations based on current locale
function getTranslations(locale: SupportedLanguage = 'ja') {
  return locale === 'ja' ? ja : en;
}

// Get current locale from browser or default to 'ja'
function getCurrentLocale(): SupportedLanguage {
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    return pathname.startsWith('/ja') ? 'ja' : pathname.includes('/') && !pathname.startsWith('/ja') ? 'en' : 'ja';
  }
  return 'ja'; // Default to Japanese
}

export interface Profile {
  id: string;
  username: string;
  email?: string;
  bio?: string;
  avatar_url?: string;
  location?: string;
  website?: string;
  twitter?: string;
  slug: string;
  github?: string;
  linkedin?: string;
  skills?: string[];
  created_at: string;
  updated_at: string;
}

export interface ProfileStats {
  totalProducts: number;
  totalVotes: number;
  totalComments: number;
  followers: number;
  following: number;
}

export interface ProfileProduct {
  id: number;
  title: string;
  description: string;
  category: string;
  tags: string[];
  votes: number;
  comments: number;
  created_at: string;
  featured: boolean;
  images: string[];
}

// プロフィール情報を取得（ID基準）
export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return {
      ...data,
      skills: [] // profile_skillsテーブルが存在しないため、空配列を返す
    };
  } catch (error) {
    console.error('Error in getProfile:', error);
    return null;
  }
}

// プロフィール情報を取得（slug基準）
export async function getProfileBySlug(slug: string): Promise<Profile | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching profile by slug:', error);
      return null;
    }

    return {
      ...data,
      skills: [] // profile_skillsテーブルが存在しないため、空配列を返す
    };
  } catch (error) {
    console.error('Error in getProfileBySlug:', error);
    return null;
  }
}

// プロフィールの統計情報を取得
export async function getProfileStats(userId: string): Promise<ProfileStats> {
  try {
    const supabase = createClient();
    // プロダクト数と獲得投票数を取得
    const { data: products } = await supabase
      .from('products')
      .select('id, votes(*)')
      .eq('user_id', userId);

    const totalProducts = products?.length || 0;
    const totalVotes = products?.reduce((sum, product) => {
      return sum + (product.votes?.length || 0);
    }, 0) || 0;

    // コメント数を取得
    const { count: totalComments } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // フォロワー数を取得
    const { count: followers } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);

    // フォロー数を取得
    const { count: following } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);

    return {
      totalProducts: totalProducts || 0,
      totalVotes: totalVotes || 0,
      totalComments: totalComments || 0,
      followers: followers || 0,
      following: following || 0
    };
  } catch (error) {
    console.error('Error fetching profile stats:', error);
    return {
      totalProducts: 0,
      totalVotes: 0,
      totalComments: 0,
      followers: 0,
      following: 0
    };
  }
}

// ユーザーのプロダクトを取得
export async function getUserProducts(userId: string): Promise<ProfileProduct[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(name, slug),
        tags:product_tags(
          tag:tags(name)
        ),
        votes(count),
        comments(count),
        images:product_images(image_url)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user products:', error);
      return [];
    }

    const locale = getCurrentLocale();
    const t = getTranslations(locale);
    
    return data.map(product => ({
      id: product.id,
      title: product.name,
      description: product.tagline,
      category: product.category?.name || t.categories.other,
      tags: product.tags?.map((t: any) => t.tag?.name) || [],
      votes: product.votes?.length || 0,
      comments: product.comments?.length || 0,
      created_at: product.created_at,
      featured: product.is_featured || false,
      images: product.images?.map((img: any) => img.image_url) || []
    }));
  } catch (error) {
    console.error('Error in getUserProducts:', error);
    return [];
  }
}

// ユーザーがアップボートしたプロダクトを取得
export async function getUserUpvotedProducts(userId: string): Promise<ProfileProduct[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('votes')
      .select(`
        product:products(
          *,
          category:categories(name, slug),
          tags:product_tags(
            tag:tags(name)
          ),
          votes(*),
          comments(*),
          images:product_images(image_url)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching upvoted products:', error);
      return [];
    }

    const locale = getCurrentLocale();
    const t = getTranslations(locale);
    
    return data.map((vote: any) => ({
      id: vote.product.id,
      title: vote.product.name,
      description: vote.product.tagline,
      category: vote.product.category?.name || t.categories.other,
      tags: vote.product.tags?.map((t: any) => t.tag?.name) || [],
      votes: vote.product.votes?.length || 0,
      comments: vote.product.comments?.length || 0,
      created_at: vote.product.created_at,
      featured: vote.product.is_featured || false,
      images: vote.product.images?.map((img: any) => img.image_url) || []
    }));
  } catch (error) {
    console.error('Error in getUserUpvotedProducts:', error);
    return [];
  }
}

// フォロー状態をチェック
export async function checkFollowStatus(followerId: string, followingId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    return !!data;
  } catch (error) {
    return false;
  }
}

// フォロー/アンフォロー
export async function toggleFollow(followerId: string, followingId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const isFollowing = await checkFollowStatus(followerId, followingId);

    if (isFollowing) {
      // アンフォロー
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);

      return !error;
    } else {
      // フォロー
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: followerId,
          following_id: followingId
        });

      return !error;
    }
  } catch (error) {
    console.error('Error toggling follow:', error);
    return false;
  }
}
