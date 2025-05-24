import { createClient } from '@supabase/supabase-js';

// Supabase types based on the schema
export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  website_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface BusinessModelDB {
  id: string;
  submitter_id: string;
  name: string;
  tagline: string;
  description: string;
  website_url: string | null;
  logo_url: string | null;
  thumbnail_url: string | null;
  launch_date: string;
  status: string;
  target_market: string | null;
  revenue_model: string | null;
  competitive_advantage: string | null;
  required_skills: string[] | null;
  initial_investment_scale: string | null;
  upvote_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  // Relations
  profiles?: Profile;
  business_model_topics?: {
    topic_id: string;
    topics?: Topic;
  }[];
}

export interface Comment {
  id: string;
  user_id: string;
  business_model_id: string;
  parent_comment_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface Upvote {
  user_id: string;
  business_model_id: string;
  created_at: string;
}

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
