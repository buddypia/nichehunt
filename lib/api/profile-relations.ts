import { createStaticClient } from '@/lib/supabase/static';

// 型定義
export interface MutualFollower {
  id: string;
  username: string;
  avatar_url: string | null;
}

export interface SimilarInterest {
  category: string;
  sharedCount: number;
}

export interface InteractionHistory {
  mutualVotes: number;
  mutualComments: number;
}

export interface SharedCollection {
  id: number;
  name: string;
  productCount: number;
}

// 共通のフォロワーを取得
export async function getMutualFollowers(
  currentUserId: string,
  targetUserId: string
): Promise<MutualFollower[]> {
  const supabase = createStaticClient();

  try {
    // 現在のユーザーのフォロワーを取得
    const { data: currentFollowers, error: currentError } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('following_id', currentUserId);

    if (currentError) throw currentError;

    // ターゲットユーザーのフォロワーを取得
    const { data: targetFollowers, error: targetError } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('following_id', targetUserId);

    if (targetError) throw targetError;

    // 共通のフォロワーIDを抽出
    const currentFollowerIds = currentFollowers?.map(f => f.follower_id) || [];
    const targetFollowerIds = targetFollowers?.map(f => f.follower_id) || [];
    const mutualIds = currentFollowerIds.filter(id => targetFollowerIds.includes(id));

    if (mutualIds.length === 0) return [];

    // 共通フォロワーの詳細情報を取得
    const { data: mutualProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .in('id', mutualIds)
      .limit(10);

    if (profilesError) throw profilesError;

    return mutualProfiles || [];
  } catch (error) {
    console.error('Error fetching mutual followers:', error);
    return [];
  }
}

// 似た興味を持つカテゴリを取得
export async function getSimilarInterests(
  currentUserId: string,
  targetUserId: string
): Promise<SimilarInterest[]> {
  const supabase = createStaticClient();

  try {
    // 現在のユーザーが投稿したプロダクトのカテゴリを取得
    const { data: currentProducts, error: currentError } = await supabase
      .from('products')
      .select('category_id, categories(name)')
      .eq('user_id', currentUserId)
      .not('category_id', 'is', null);

    if (currentError) throw currentError;

    // ターゲットユーザーが投稿したプロダクトのカテゴリを取得
    const { data: targetProducts, error: targetError } = await supabase
      .from('products')
      .select('category_id, categories(name)')
      .eq('user_id', targetUserId)
      .not('category_id', 'is', null);

    if (targetError) throw targetError;

    // 現在のユーザーがアップボートしたプロダクトのカテゴリも取得
    const { data: currentVotedProducts, error: currentVotedError } = await supabase
      .from('votes')
      .select('products(category_id, categories(name))')
      .eq('user_id', currentUserId);

    if (currentVotedError) throw currentVotedError;

    // ターゲットユーザーがアップボートしたプロダクトのカテゴリも取得
    const { data: targetVotedProducts, error: targetVotedError } = await supabase
      .from('votes')
      .select('products(category_id, categories(name))')
      .eq('user_id', targetUserId);

    if (targetVotedError) throw targetVotedError;

    // カテゴリをカウント
    const categoryCount = new Map<string, { current: number; target: number }>();

    // 投稿したプロダクトのカテゴリをカウント
    currentProducts?.forEach((p: any) => {
      if (p.categories && typeof p.categories === 'object' && 'name' in p.categories) {
        const name = p.categories.name;
        if (!categoryCount.has(name)) {
          categoryCount.set(name, { current: 0, target: 0 });
        }
        categoryCount.get(name)!.current++;
      }
    });

    targetProducts?.forEach((p: any) => {
      if (p.categories && typeof p.categories === 'object' && 'name' in p.categories) {
        const name = p.categories.name;
        if (!categoryCount.has(name)) {
          categoryCount.set(name, { current: 0, target: 0 });
        }
        categoryCount.get(name)!.target++;
      }
    });

    // アップボートしたプロダクトのカテゴリもカウント
    currentVotedProducts?.forEach((v: any) => {
      if (v.products && v.products.categories && typeof v.products.categories === 'object' && 'name' in v.products.categories) {
        const name = v.products.categories.name;
        if (!categoryCount.has(name)) {
          categoryCount.set(name, { current: 0, target: 0 });
        }
        categoryCount.get(name)!.current++;
      }
    });

    targetVotedProducts?.forEach((v: any) => {
      if (v.products && v.products.categories && typeof v.products.categories === 'object' && 'name' in v.products.categories) {
        const name = v.products.categories.name;
        if (!categoryCount.has(name)) {
          categoryCount.set(name, { current: 0, target: 0 });
        }
        categoryCount.get(name)!.target++;
      }
    });

    // 共通の興味があるカテゴリを抽出
    const similarInterests: SimilarInterest[] = [];
    categoryCount.forEach((counts, category) => {
      if (counts.current > 0 && counts.target > 0) {
        similarInterests.push({
          category,
          sharedCount: Math.min(counts.current, counts.target)
        });
      }
    });

    // 共有カウントでソート
    return similarInterests.sort((a, b) => b.sharedCount - a.sharedCount).slice(0, 5);
  } catch (error) {
    console.error('Error fetching similar interests:', error);
    return [];
  }
}

// インタラクション履歴を取得
export async function getInteractionHistory(
  currentUserId: string,
  targetUserId: string
): Promise<InteractionHistory | null> {
  const supabase = createStaticClient();

  try {
    // まず各ユーザーのプロダクトIDを取得
    const { data: targetProducts, error: targetProductsError } = await supabase
      .from('products')
      .select('id')
      .eq('user_id', targetUserId);
    
    if (targetProductsError) throw targetProductsError;
    const targetProductIds = targetProducts?.map(p => p.id) || [];

    const { data: currentProducts, error: currentProductsError } = await supabase
      .from('products')
      .select('id')
      .eq('user_id', currentUserId);
    
    if (currentProductsError) throw currentProductsError;
    const currentProductIds = currentProducts?.map(p => p.id) || [];

    let currentToTargetVotes = 0;
    let targetToCurrentVotes = 0;
    let currentToTargetComments = 0;
    let targetToCurrentComments = 0;

    // 相互アップボートの数を取得
    if (targetProductIds.length > 0) {
      const { count, error: cttError } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', currentUserId)
        .in('product_id', targetProductIds);
      
      if (cttError) throw cttError;
      currentToTargetVotes = count || 0;
    }

    if (currentProductIds.length > 0) {
      const { count, error: ttcError } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', targetUserId)
        .in('product_id', currentProductIds);
      
      if (ttcError) throw ttcError;
      targetToCurrentVotes = count || 0;
    }

    // 相互コメントの数を取得
    if (targetProductIds.length > 0) {
      const { count, error: cttcError } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', currentUserId)
        .in('product_id', targetProductIds);
      
      if (cttcError) throw cttcError;
      currentToTargetComments = count || 0;
    }

    if (currentProductIds.length > 0) {
      const { count, error: ttccError } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', targetUserId)
        .in('product_id', currentProductIds);
      
      if (ttccError) throw ttccError;
      targetToCurrentComments = count || 0;
    }

    const mutualVotes = Math.min(currentToTargetVotes || 0, targetToCurrentVotes || 0);
    const mutualComments = Math.min(currentToTargetComments || 0, targetToCurrentComments || 0);

    return {
      mutualVotes,
      mutualComments
    };
  } catch (error) {
    console.error('Error fetching interaction history:', error);
    return null;
  }
}

// 共有コレクションを取得
export async function getSharedCollections(
  currentUserId: string,
  targetUserId: string
): Promise<SharedCollection[]> {
  const supabase = createStaticClient();

  try {
    // 現在のユーザーのコレクションに含まれるプロダクトIDを取得
    const { data: currentCollectionProducts, error: currentError } = await supabase
      .from('collection_products')
      .select('product_id, collections!inner(user_id)')
      .eq('collections.user_id', currentUserId);

    if (currentError) throw currentError;

    // ターゲットユーザーのコレクションに含まれるプロダクトIDを取得
    const { data: targetCollections, error: targetError } = await supabase
      .from('collections')
      .select(`
        id,
        name,
        collection_products(product_id)
      `)
      .eq('user_id', targetUserId)
      .eq('is_public', true);

    if (targetError) throw targetError;

    const currentProductIds = currentCollectionProducts?.map(cp => cp.product_id) || [];
    const sharedCollections: SharedCollection[] = [];

    // 各ターゲットコレクションで共有プロダクトをカウント
    targetCollections?.forEach(collection => {
      const productIds = collection.collection_products?.map(cp => cp.product_id) || [];
      const sharedCount = productIds.filter(id => currentProductIds.includes(id)).length;
      
      if (sharedCount > 0) {
        sharedCollections.push({
          id: collection.id,
          name: collection.name,
          productCount: sharedCount
        });
      }
    });

    return sharedCollections.sort((a, b) => b.productCount - a.productCount).slice(0, 5);
  } catch (error) {
    console.error('Error fetching shared collections:', error);
    return [];
  }
}
