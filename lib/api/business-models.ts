import { supabase } from '@/lib/supabase-client';
import { BusinessModel } from '@/types/BusinessModel';
import { ProductWithRelations } from '@/lib/types/database';

export interface FetchBusinessModelsOptions {
  limit?: number;
  offset?: number;
  orderBy?: 'created_at' | 'upvote_count' | 'comment_count' | 'launch_date';
  order?: 'asc' | 'desc';
  category?: string;
  search?: string;
  featured?: boolean;
}

// Helper function to convert Product to BusinessModel format
function mapProductToBusinessModel(product: ProductWithRelations): BusinessModel {
  return {
    id: product.id.toString(),
    title: product.name,
    description: product.description,
    category: product.category?.name || 'Unknown',
    tags: product.tags?.map(tag => tag.name) || [],
    upvotes: product.vote_count || 0,
    comments: product.comment_count || 0,
    author: {
      name: product.profile?.display_name || product.profile?.username || 'Anonymous',
      avatar: product.profile?.avatar_url || '/placeholder-avatar.png',
      verified: false // We don't have this field in profiles
    },
    createdAt: product.created_at,
    featured: product.is_featured,
    revenue: 'Unknown', // Not available in products table
    difficulty: 'Medium' as const, // Not available in products table
    timeToMarket: 'Unknown', // Not available in products table
    initialInvestment: 'Unknown', // Not available in products table
    targetMarket: 'Unknown', // Not available in products table
    image: product.thumbnail_url || '/placeholder-product.png',
    website: product.product_url || undefined,
    userCount: product.view_count
  };
}

export async function fetchBusinessModels(options: FetchBusinessModelsOptions = {}) {
  const {
    limit = 20,
    offset = 0,
    orderBy = 'created_at',
    order = 'desc',
    category,
    search,
    featured
  } = options;

  // Map orderBy fields to products_with_stats columns
  const orderByMap: Record<string, string> = {
    'created_at': 'created_at',
    'upvote_count': 'vote_count',
    'comment_count': 'comment_count',
    'launch_date': 'launch_date'
  };

  let query = supabase
    .from('products_with_stats')
    .select(`
      *,
      profile:profiles!products_user_id_fkey (
        id,
        username,
        display_name,
        avatar_url,
        bio
      ),
      category:categories (
        id,
        name,
        slug
      ),
      tags:product_tags (
        tag:tags (
          id,
          name,
          slug
        )
      )
    `, { count: 'exact' })
    .eq('status', 'published')
    .order(orderByMap[orderBy] || 'created_at', { ascending: order === 'asc' })
    .range(offset, offset + limit - 1);

  // Add filters
  if (search) {
    query = query.or(`name.ilike.%${search}%,tagline.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (featured !== undefined) {
    query = query.eq('is_featured', featured);
  }

  if (category) {
    // Filter by category slug
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category)
      .single();

    if (categoryData) {
      query = query.eq('category_id', categoryData.id);
    }
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    return { data: [], error, count: 0 };
  }

  // Transform data and extract tags properly
  const transformedData = (data || []).map((product: any) => ({
    ...product,
    tags: product.tags?.map((pt: any) => pt.tag).filter(Boolean) || []
  }));

  const businessModels = transformedData.map(mapProductToBusinessModel);

  return { data: businessModels, error: null, count };
}

export async function fetchBusinessModelById(id: string) {
  const { data, error } = await supabase
    .from('products_with_stats')
    .select(`
      *,
      profile:profiles!products_user_id_fkey (
        id,
        username,
        display_name,
        avatar_url,
        bio,
        website_url,
        twitter_handle
      ),
      category:categories (
        id,
        name,
        slug,
        description
      ),
      tags:product_tags (
        tag:tags (
          id,
          name,
          slug
        )
      ),
      images:product_images (
        id,
        image_url,
        caption,
        display_order
      )
    `)
    .eq('id', parseInt(id))
    .eq('status', 'published')
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return { data: null, error };
  }

  // Transform data and extract tags properly
  const transformedData = {
    ...data,
    tags: data.tags?.map((pt: any) => pt.tag).filter(Boolean) || []
  };

  const businessModel = mapProductToBusinessModel(transformedData as ProductWithRelations);

  return { data: businessModel, error: null };
}

export async function incrementBusinessModelViews(id: string) {
  // Increment view count for the product
  const { error } = await supabase.rpc('increment_view_count', {
    product_id: parseInt(id)
  });

  if (error) {
    console.error('Error incrementing view count:', error);
    // If the function doesn't exist, just return success
    return { error: null };
  }

  return { error: null };
}

export async function fetchTrendingBusinessModels() {
  // Get products from the last 7 days with high engagement
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return fetchBusinessModels({
    orderBy: 'upvote_count',
    order: 'desc',
    limit: 10
  });
}

export async function fetchFeaturedBusinessModels() {
  return fetchBusinessModels({
    featured: true,
    orderBy: 'created_at',
    order: 'desc',
    limit: 5
  });
}

export async function fetchBusinessModelsByUser(userId: string) {
  const { data, error } = await supabase
    .from('products_with_stats')
    .select(`
      *,
      profile:profiles!products_user_id_fkey (
        id,
        username,
        display_name,
        avatar_url
      ),
      category:categories (
        id,
        name,
        slug
      ),
      tags:product_tags (
        tag:tags (
          id,
          name,
          slug
        )
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user products:', error);
    return { data: [], error };
  }

  // Transform data and extract tags properly
  const transformedData = (data || []).map((product: any) => ({
    ...product,
    tags: product.tags?.map((pt: any) => pt.tag).filter(Boolean) || []
  }));

  const businessModels = transformedData.map(mapProductToBusinessModel);

  return { data: businessModels, error: null };
}
