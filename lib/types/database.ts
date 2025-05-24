export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          website_url: string | null
          twitter_handle: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          website_url?: string | null
          twitter_handle?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          website_url?: string | null
          twitter_handle?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: number
          name: string
          slug: string
          description: string | null
          icon_name: string | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
          description?: string | null
          icon_name?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          description?: string | null
          icon_name?: string | null
          created_at?: string
        }
      }
      tags: {
        Row: {
          id: number
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          created_at?: string
        }
      }
      products: {
        Row: {
          id: number
          user_id: string
          name: string
          tagline: string
          description: string
          product_url: string | null
          github_url: string | null
          demo_url: string | null
          thumbnail_url: string | null
          category_id: number | null
          status: 'draft' | 'published' | 'archived'
          launch_date: string
          is_featured: boolean
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          name: string
          tagline: string
          description: string
          product_url?: string | null
          github_url?: string | null
          demo_url?: string | null
          thumbnail_url?: string | null
          category_id?: number | null
          status?: 'draft' | 'published' | 'archived'
          launch_date?: string
          is_featured?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          name?: string
          tagline?: string
          description?: string
          product_url?: string | null
          github_url?: string | null
          demo_url?: string | null
          thumbnail_url?: string | null
          category_id?: number | null
          status?: 'draft' | 'published' | 'archived'
          launch_date?: string
          is_featured?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      product_tags: {
        Row: {
          product_id: number
          tag_id: number
        }
        Insert: {
          product_id: number
          tag_id: number
        }
        Update: {
          product_id?: number
          tag_id?: number
        }
      }
      product_images: {
        Row: {
          id: number
          product_id: number
          image_url: string
          caption: string | null
          display_order: number
          created_at: string
        }
        Insert: {
          id?: number
          product_id: number
          image_url: string
          caption?: string | null
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: number
          product_id?: number
          image_url?: string
          caption?: string | null
          display_order?: number
          created_at?: string
        }
      }
      votes: {
        Row: {
          user_id: string
          product_id: number
          created_at: string
        }
        Insert: {
          user_id: string
          product_id: number
          created_at?: string
        }
        Update: {
          user_id?: string
          product_id?: number
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: number
          user_id: string
          product_id: number
          parent_id: number | null
          content: string
          is_edited: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          product_id: number
          parent_id?: number | null
          content: string
          is_edited?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          product_id?: number
          parent_id?: number | null
          content?: string
          is_edited?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      collections: {
        Row: {
          id: number
          user_id: string
          name: string
          description: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          name: string
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          name?: string
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      collection_products: {
        Row: {
          collection_id: number
          product_id: number
          added_at: string
        }
        Insert: {
          collection_id: number
          product_id: number
          added_at?: string
        }
        Update: {
          collection_id?: number
          product_id?: number
          added_at?: string
        }
      }
      follows: {
        Row: {
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: number
          user_id: string
          type: string
          title: string
          message: string | null
          related_product_id: number | null
          related_user_id: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          type: string
          title: string
          message?: string | null
          related_product_id?: number | null
          related_user_id?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          type?: string
          title?: string
          message?: string | null
          related_product_id?: number | null
          related_user_id?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      products_with_stats: {
        Row: {
          id: number
          user_id: string
          name: string
          tagline: string
          description: string
          product_url: string | null
          github_url: string | null
          demo_url: string | null
          thumbnail_url: string | null
          category_id: number | null
          status: 'draft' | 'published' | 'archived'
          launch_date: string
          is_featured: boolean
          view_count: number
          created_at: string
          updated_at: string
          vote_count: number
          comment_count: number
        }
      }
    }
    Functions: {
      toggle_vote: {
        Args: {
          p_product_id: number
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// 拡張型定義
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Tag = Database['public']['Tables']['tags']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type ProductTag = Database['public']['Tables']['product_tags']['Row']
export type ProductImage = Database['public']['Tables']['product_images']['Row']
export type Vote = Database['public']['Tables']['votes']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type Collection = Database['public']['Tables']['collections']['Row']
export type CollectionProduct = Database['public']['Tables']['collection_products']['Row']
export type Follow = Database['public']['Tables']['follows']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']

// ビュー型
export type ProductWithStats = Database['public']['Views']['products_with_stats']['Row']

// 拡張型（リレーションを含む）
export interface ProductWithRelations extends ProductWithStats {
  profile?: Profile
  category?: Category
  tags?: Tag[]
  images?: ProductImage[]
  has_voted?: boolean
}

export interface CommentWithRelations extends Comment {
  profile?: Profile
  replies?: CommentWithRelations[]
}

export interface CollectionWithRelations extends Collection {
  products?: ProductWithRelations[]
  profile?: Profile
}

export interface ProfileWithStats extends Profile {
  product_count?: number
  follower_count?: number
  following_count?: number
  is_following?: boolean
}
