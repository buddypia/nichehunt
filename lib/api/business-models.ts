import { supabase } from '@/lib/supabase-client';
import { BusinessModel } from '@/types/BusinessModel';

export interface FetchBusinessModelsOptions {
  limit?: number;
  offset?: number;
  orderBy?: 'created_at' | 'upvote_count' | 'comment_count' | 'launch_date';
  order?: 'asc' | 'desc';
  topic?: string;
  search?: string;
  featured?: boolean;
}

export async function fetchBusinessModels(options: FetchBusinessModelsOptions = {}) {
  const {
    limit = 20,
    offset = 0,
    orderBy = 'created_at',
    order = 'desc',
    topic,
    search,
    featured
  } = options;

  let query = supabase
    .from('business_models')
    .select(`
      *,
      profiles:submitter_id (
        id,
        username,
        avatar_url,
        bio
      ),
      business_model_topics (
        topic_id,
        topics (
          id,
          name,
          slug
        )
      )
    `)
    .order(orderBy, { ascending: order === 'asc' })
    .range(offset, offset + limit - 1);

  // Add filters
  if (search) {
    query = query.or(`name.ilike.%${search}%,tagline.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (featured !== undefined) {
    query = query.eq('featured', featured as any);
  }

  if (topic) {
    // Filter by topic slug
    const { data: topicData } = await supabase
      .from('topics')
      .select('id')
      .eq('slug', topic as any)
      .single();

    if (topicData && 'id' in topicData) {
      const { data: businessModelIds } = await supabase
        .from('business_model_topics')
        .select('business_model_id')
        .eq('topic_id', topicData.id as any);

      if (businessModelIds && businessModelIds.length > 0) {
        const ids = businessModelIds.map(item => (item as any).business_model_id);
        query = query.in('id', ids);
      }
    }
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching business models:', error);
    return { data: [], error, count: 0 };
  }

  return { data: (data || []) as unknown as BusinessModel[], error: null, count };
}

export async function fetchBusinessModelById(id: string) {
  const { data, error } = await supabase
    .from('business_models')
    .select(`
      *,
      profiles:submitter_id (
        id,
        username,
        avatar_url,
        bio,
        website_url,
        twitter_url,
        github_url,
        linkedin_url
      ),
      business_model_topics (
        topic_id,
        topics (
          id,
          name,
          slug,
          description
        )
      )
    `)
    .eq('id', id as any)
    .single();

  if (error) {
    console.error('Error fetching business model:', error);
    return { data: null, error };
  }

  return { data: data as unknown as BusinessModel, error: null };
}

export async function incrementBusinessModelViews(id: string) {
  // Since we don't have a views column, we'll just return success
  // This is a placeholder for future implementation
  return { error: null };
}

export async function fetchTrendingBusinessModels() {
  // Get business models from the last 7 days with high engagement
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
    .from('business_models')
    .select(`
      *,
      business_model_topics (
        topic_id,
        topics (
          id,
          name,
          slug
        )
      )
    `)
    .eq('submitter_id', userId as any)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user business models:', error);
    return { data: [], error };
  }

  return { data: (data || []) as unknown as BusinessModel[], error: null };
}
