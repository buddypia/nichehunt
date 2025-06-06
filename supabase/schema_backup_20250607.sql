-- NicheNext Supabase Database Schema Backup
-- Generated on: 2025-06-07 00:56:10 JST
-- Project ID: nyniibuebpmsbmzhccjr
-- Database Version: PostgreSQL 15.8.1.093

-- ============================================
-- DATABASE SCHEMAS
-- ============================================

-- Main schemas in the database:
-- - public: Application tables
-- - auth: Supabase authentication system
-- - storage: Supabase storage system

-- ============================================
-- PUBLIC SCHEMA TABLES
-- ============================================

-- profiles table
CREATE TABLE public.profiles (
    id uuid NOT NULL,
    username character varying NOT NULL,
    display_name character varying,
    bio text,
    avatar_url text,
    website_url text,
    twitter_handle character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    CONSTRAINT profiles_pkey PRIMARY KEY (id),
    CONSTRAINT profiles_username_key UNIQUE (username),
    CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- categories table
CREATE TABLE public.categories (
    id integer NOT NULL DEFAULT nextval('categories_id_seq'::regclass),
    name character varying NOT NULL,
    slug character varying NOT NULL,
    description text,
    icon_name character varying,
    created_at timestamp with time zone DEFAULT now(),
    
    CONSTRAINT categories_pkey PRIMARY KEY (id),
    CONSTRAINT categories_name_key UNIQUE (name),
    CONSTRAINT categories_slug_key UNIQUE (slug)
);

-- tags table
CREATE TABLE public.tags (
    id integer NOT NULL DEFAULT nextval('tags_id_seq'::regclass),
    name character varying,
    slug character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    
    CONSTRAINT tags_pkey PRIMARY KEY (id),
    CONSTRAINT tags_slug_key UNIQUE (slug)
);

-- products table
CREATE TABLE public.products (
    id integer NOT NULL DEFAULT nextval('products_id_seq'::regclass),
    user_id uuid NOT NULL,
    name character varying NOT NULL,
    tagline character varying NOT NULL,
    description text NOT NULL,
    product_url text,
    github_url text,
    demo_url text,
    thumbnail_url text,
    category_id integer,
    status character varying DEFAULT 'published'::character varying,
    launch_date date DEFAULT CURRENT_DATE,
    is_featured boolean DEFAULT false,
    view_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    CONSTRAINT products_pkey PRIMARY KEY (id),
    CONSTRAINT products_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
    CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
    CONSTRAINT products_status_check CHECK (status::text = ANY (ARRAY['draft'::character varying, 'published'::character varying, 'archived'::character varying]::text[]))
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- product_tags table (many-to-many relationship)
CREATE TABLE public.product_tags (
    product_id integer NOT NULL,
    tag_id integer NOT NULL,
    
    CONSTRAINT product_tags_pkey PRIMARY KEY (product_id, tag_id),
    CONSTRAINT product_tags_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
    CONSTRAINT product_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id)
);

-- product_images table
CREATE TABLE public.product_images (
    id integer NOT NULL DEFAULT nextval('product_images_id_seq'::regclass),
    product_id integer NOT NULL,
    image_url text NOT NULL,
    caption text,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    
    CONSTRAINT product_images_pkey PRIMARY KEY (id),
    CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);

-- votes table
CREATE TABLE public.votes (
    user_id uuid NOT NULL,
    product_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    
    CONSTRAINT votes_pkey PRIMARY KEY (user_id, product_id),
    CONSTRAINT votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
    CONSTRAINT votes_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);

-- Enable RLS
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- comments table
CREATE TABLE public.comments (
    id integer NOT NULL DEFAULT nextval('comments_id_seq'::regclass),
    user_id uuid NOT NULL,
    product_id integer NOT NULL,
    parent_id integer,
    content text NOT NULL,
    is_edited boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    CONSTRAINT comments_pkey PRIMARY KEY (id),
    CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
    CONSTRAINT comments_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
    CONSTRAINT comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.comments(id)
);

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- collections table
CREATE TABLE public.collections (
    id integer NOT NULL DEFAULT nextval('collections_id_seq'::regclass),
    user_id uuid NOT NULL,
    name character varying NOT NULL,
    description text,
    is_public boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    CONSTRAINT collections_pkey PRIMARY KEY (id),
    CONSTRAINT collections_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- collection_products table (many-to-many relationship)
CREATE TABLE public.collection_products (
    collection_id integer NOT NULL,
    product_id integer NOT NULL,
    added_at timestamp with time zone DEFAULT now(),
    
    CONSTRAINT collection_products_pkey PRIMARY KEY (collection_id, product_id),
    CONSTRAINT collection_products_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES public.collections(id),
    CONSTRAINT collection_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);

-- Enable RLS
ALTER TABLE public.collection_products ENABLE ROW LEVEL SECURITY;

-- follows table
CREATE TABLE public.follows (
    follower_id uuid NOT NULL,
    following_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    
    CONSTRAINT follows_pkey PRIMARY KEY (follower_id, following_id),
    CONSTRAINT follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.profiles(id),
    CONSTRAINT follows_following_id_fkey FOREIGN KEY (following_id) REFERENCES public.profiles(id)
);

-- notifications table
CREATE TABLE public.notifications (
    id integer NOT NULL DEFAULT nextval('notifications_id_seq'::regclass),
    user_id uuid NOT NULL,
    type character varying NOT NULL,
    title character varying NOT NULL,
    message text,
    related_product_id integer,
    related_user_id uuid,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    
    CONSTRAINT notifications_pkey PRIMARY KEY (id),
    CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
    CONSTRAINT notifications_related_product_id_fkey FOREIGN KEY (related_product_id) REFERENCES public.products(id),
    CONSTRAINT notifications_related_user_id_fkey FOREIGN KEY (related_user_id) REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- AUTH SCHEMA TABLES (Supabase Authentication)
-- ============================================

-- Note: These are managed by Supabase and should not be modified directly
-- Main tables:
-- - auth.users: User authentication data
-- - auth.identities: OAuth/SSO identities
-- - auth.sessions: User sessions
-- - auth.refresh_tokens: JWT refresh tokens
-- - auth.mfa_factors: Multi-factor authentication
-- - auth.audit_log_entries: Authentication audit trail

-- ============================================
-- STORAGE SCHEMA TABLES (Supabase Storage)
-- ============================================

-- Note: These are managed by Supabase for file storage
-- Main tables:
-- - storage.buckets: Storage bucket configuration
-- - storage.objects: File objects metadata
-- - storage.migrations: Storage system migrations

-- ============================================
-- SEQUENCES
-- ============================================

-- Sequences for auto-incrementing IDs
CREATE SEQUENCE IF NOT EXISTS categories_id_seq;
CREATE SEQUENCE IF NOT EXISTS tags_id_seq;
CREATE SEQUENCE IF NOT EXISTS products_id_seq;
CREATE SEQUENCE IF NOT EXISTS product_images_id_seq;
CREATE SEQUENCE IF NOT EXISTS comments_id_seq;
CREATE SEQUENCE IF NOT EXISTS collections_id_seq;
CREATE SEQUENCE IF NOT EXISTS notifications_id_seq;

-- ============================================
-- TABLE STATISTICS (as of backup date)
-- ============================================

-- profiles: 11 live rows, 15 dead rows (80 kB)
-- categories: 12 live rows, 24 dead rows (64 kB)
-- tags: 30 live rows, 30 dead rows (48 kB)
-- products: 45 live rows, 10 dead rows (144 kB)
-- product_tags: 92 live rows, 0 dead rows (24 kB)
-- product_images: 33 live rows, 0 dead rows (32 kB)
-- votes: 74 live rows, 20 dead rows (56 kB)
-- comments: 31 live rows, 3 dead rows (64 kB)
-- collections: 10 live rows, 5 dead rows (32 kB)
-- collection_products: 31 live rows, 18 dead rows (24 kB)
-- follows: 12 live rows, 3 dead rows (24 kB)
-- notifications: 35 live rows, 7 dead rows (64 kB)

-- ============================================
-- IMPORTANT NOTES
-- ============================================

-- 1. Row Level Security (RLS) is enabled on:
--    - profiles, products, votes, comments, collections, collection_products, notifications
--
-- 2. Complex relationships:
--    - products ↔ tags (many-to-many via product_tags)
--    - collections ↔ products (many-to-many via collection_products)
--    - profiles ↔ profiles (self-referencing via follows)
--    - comments support nesting via parent_id self-reference
--
-- 3. All auth.* and storage.* tables are managed by Supabase
--    and should not be modified directly
--
-- 4. This schema supports:
--    - User authentication and profiles
--    - Product/business idea management
--    - Social features (voting, comments, following)
--    - Content organization (categories, tags, collections)
--    - Real-time notifications
--    - File storage integration

-- ============================================
-- BACKUP VERIFICATION
-- ============================================

-- Total tables in public schema: 12
-- Total tables in auth schema: 17
-- Total tables in storage schema: 5
-- Database size estimate: ~2MB (based on table sizes)
-- PostgreSQL version: 15.8.1.093
-- Region: ap-northeast-1 (Asia Pacific - Tokyo)
