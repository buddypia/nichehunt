import { supabase, BusinessModelDB, Profile, Topic } from './supabase-client';
import { BusinessModel } from '@/types/BusinessModel';

// Helper function to convert database model to app model
export function convertDBToBusinessModel(dbModel: BusinessModelDB): BusinessModel {
  
  const topics = dbModel.business_model_topics?.map(bt => bt.topics?.name || '').filter(Boolean) || [];
  
  // Map difficulty based on initial_investment_scale
  const difficultyMap: { [key: string]: 'Easy' | 'Medium' | 'Hard' } = {
    'low': 'Easy',
    'medium': 'Medium',
    'high': 'Hard'
  };

  // Map status to featured
  const featured = dbModel.status === 'featured';

  const converted = {
    id: dbModel.id,
    title: dbModel.name,
    description: dbModel.description,
    category: topics[0] || 'その他',
    tags: dbModel.required_skills || [],
    upvotes: dbModel.upvote_count,
    comments: dbModel.comment_count,
    author: {
      name: dbModel.profiles?.username || 'Unknown',
      avatar: dbModel.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${dbModel.submitter_id}`,
      verified: false // This could be added to profiles table if needed
    },
    createdAt: new Date(dbModel.created_at).toISOString().split('T')[0],
    featured: featured,
    revenue: dbModel.revenue_model || '未定',
    difficulty: difficultyMap[dbModel.initial_investment_scale || 'medium'] || 'Medium',
    timeToMarket: '3-6ヶ月', // This could be added to the database
    initialInvestment: dbModel.initial_investment_scale === 'low' ? '50万円以下' : 
                      dbModel.initial_investment_scale === 'high' ? '300万円以上' : '50-300万円',
    targetMarket: dbModel.target_market || '未定',
    image: dbModel.thumbnail_url || 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=600',
    website: dbModel.website_url || undefined
  };

  return converted;
}

// Helper function to remove duplicates from business model results
function removeDuplicateModels(models: any[]): any[] {
  const uniqueModelsMap = new Map();
  
  models.forEach(model => {
    if (!uniqueModelsMap.has(model.id)) {
      uniqueModelsMap.set(model.id, model);
    }
  });
  
  return Array.from(uniqueModelsMap.values());
}

// Fetch today's business models
export async function fetchTodaysBusinessModels() {
  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    // First, try to get models posted today
    const { data: todaysModels, error: todaysError } = await supabase
      .from('business_models')
      .select(`
        *,
        profiles!submitter_id (
          id,
          username,
          avatar_url
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
      .in('status', ['published', 'featured', 'approved'])
      .gte('created_at', todayStr)
      .lt('created_at', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString())
      .order('upvote_count', { ascending: false })
      .order('created_at', { ascending: false });

    if (!todaysError && todaysModels && todaysModels.length > 0) {
      const uniqueModels = removeDuplicateModels(todaysModels);
      return uniqueModels.map(convertDBToBusinessModel);
    }

    // If no models today, get popular models from last 30 days (instead of 7)
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const { data: monthModels, error: monthError } = await supabase
      .from('business_models')
      .select(`
        *,
        profiles!submitter_id (
          id,
          username,
          avatar_url
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
      .in('status', ['published', 'featured', 'approved'])
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('upvote_count', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(10);

    if (!monthError && monthModels && monthModels.length > 0) {
      const uniqueModels = removeDuplicateModels(monthModels);
      return uniqueModels.map(convertDBToBusinessModel);
    }

    // If still no models, get all-time popular models
    const { data: allTimeModels, error: allTimeError } = await supabase
      .from('business_models')
      .select(`
        *,
        profiles!submitter_id (
          id,
          username,
          avatar_url
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
      .in('status', ['published', 'featured', 'approved'])
      .order('upvote_count', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(10);

    if (allTimeError) {
      console.error('Error fetching all-time popular models:', allTimeError);
      return [];
    }

    const uniqueModels = removeDuplicateModels(allTimeModels || []);
    return uniqueModels.map(convertDBToBusinessModel);
  } catch (err) {
    console.error('Unexpected error in fetchTodaysBusinessModels:', err);
    return [];
  }
}

// Fetch all business models
export async function fetchBusinessModels() {
  try {
    const { data, error } = await supabase
      .from('business_models')
      .select(`
        *,
        profiles!submitter_id (
          id,
          username,
          avatar_url
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
      .in('status', ['published', 'featured', 'approved'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching business models:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    const uniqueModels = removeDuplicateModels(data);
    return uniqueModels.map(convertDBToBusinessModel);
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
}

// Fetch business models by category
export async function fetchBusinessModelsByCategory(categorySlug: string) {
  try {
    // First, get the topic ID from slug
    const { data: topicData, error: topicError } = await supabase
      .from('topics')
      .select('id')
      .eq('slug', categorySlug)
      .single();

    if (topicError || !topicData) {
      console.error('Error fetching topic:', topicError);
      return [];
    }

    // Then fetch business models with that topic
    const { data, error } = await supabase
      .from('business_models')
      .select(`
        *,
        profiles!submitter_id (
          id,
          username,
          avatar_url
        ),
        business_model_topics!inner (
          topic_id,
          topics (
            id,
            name,
            slug
          )
        )
      `)
      .eq('business_model_topics.topic_id', topicData.id)
      .in('status', ['published', 'featured', 'approved'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching business models by category:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map(convertDBToBusinessModel);
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
}

// Fetch single business model
export async function fetchBusinessModel(id: string) {
  try {
    const { data, error } = await supabase
      .from('business_models')
      .select(`
        *,
        profiles!submitter_id (
          id,
          username,
          avatar_url,
          bio,
          website_url
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
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Error fetching business model:', error);
      return null;
    }

    return convertDBToBusinessModel(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    return null;
  }
}

// Fetch profile by username
export async function fetchProfileByUsername(username: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !data) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data as Profile;
  } catch (err) {
    console.error('Unexpected error:', err);
    return null;
  }
}

// Fetch business models by user
export async function fetchBusinessModelsByUser(userId: string) {
  try {
    const { data, error } = await supabase
      .from('business_models')
      .select(`
        *,
        profiles!submitter_id (
          id,
          username,
          avatar_url
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
      .eq('submitter_id', userId)
      .in('status', ['published', 'featured', 'approved'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user business models:', error);
      return [];
    }

    return data.map(convertDBToBusinessModel);
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
}

// Fetch all topics
export async function fetchTopics() {
  try {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .is('parent_id', null)
      .order('name');

    if (error) {
      console.error('Error fetching topics:', error);
      return [];
    }

    return data as Topic[];
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
}

// Check if user has upvoted
export async function checkUserUpvote(userId: string, businessModelId: string) {
  try {
    const { data, error } = await supabase
      .from('upvotes')
      .select('*')
      .eq('user_id', userId)
      .eq('business_model_id', businessModelId)
      .single();

    return !!data && !error;
  } catch (err) {
    console.error('Unexpected error:', err);
    return false;
  }
}

// Toggle upvote
export async function toggleUpvote(userId: string, businessModelId: string) {
  try {
    const hasUpvoted = await checkUserUpvote(userId, businessModelId);

    if (hasUpvoted) {
      // Remove upvote
      const { error } = await supabase
        .from('upvotes')
        .delete()
        .eq('user_id', userId)
        .eq('business_model_id', businessModelId);

      if (error) {
        console.error('Error removing upvote:', error);
        return false;
      }
    } else {
      // Add upvote
      const { error } = await supabase
        .from('upvotes')
        .insert({
          user_id: userId,
          business_model_id: businessModelId
        });

      if (error) {
        console.error('Error adding upvote:', error);
        return false;
      }
    }

    return true;
  } catch (err) {
    console.error('Unexpected error:', err);
    return false;
  }
}

// Fetch comments for a business model
export async function fetchComments(businessModelId: string) {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles!user_id (
          id,
          username,
          avatar_url
        )
      `)
      .eq('business_model_id', businessModelId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching comments:', error);
      return [];
    }

    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
}

// Add a comment
export async function addComment(userId: string, businessModelId: string, content: string, parentCommentId?: string) {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: userId,
        business_model_id: businessModelId,
        content: content,
        parent_comment_id: parentCommentId || null
      })
      .select(`
        *,
        profiles!user_id (
          id,
          username,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Error adding comment:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    return null;
  }
}

// Search business models
export async function searchBusinessModels(query: string) {
  try {
    const { data, error } = await supabase
      .from('business_models')
      .select(`
        *,
        profiles!submitter_id (
          id,
          username,
          avatar_url
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
      .in('status', ['published', 'featured', 'approved'])
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,tagline.ilike.%${query}%`)
      .order('upvote_count', { ascending: false });

    if (error) {
      console.error('Error searching business models:', error);
      return [];
    }

    const uniqueModels = removeDuplicateModels(data || []);
    return uniqueModels.slice(0, 20).map(convertDBToBusinessModel);
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
}

// Test Supabase connection
export async function testSupabaseConnection() {
  try {
    // Test 1: Check if we can connect to Supabase
    const { data: testData, error: testError } = await supabase
      .from('business_models')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('Connection test failed:', testError);
      return false;
    }
    
    // Test 2: Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing environment variables');
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Connection test error:', err);
    return false;
  }
}
