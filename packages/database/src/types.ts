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
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          icon: string | null
          description: string | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          icon?: string | null
          description?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          icon?: string | null
          description?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      segments: {
        Row: {
          id: string
          category_id: string
          name: string
          slug: string
          description: string | null
          price_min: number | null
          price_max: number | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          name: string
          slug: string
          description?: string | null
          price_min?: number | null
          price_max?: number | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          name?: string
          slug?: string
          description?: string | null
          price_min?: number | null
          price_max?: number | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          category_id: string
          segment_id: string | null
          name: string
          slug: string
          brand: string | null
          model: string | null
          model_year: number | null
          price_min: number | null
          price_max: number | null
          currency: string
          image_url: string | null
          images: Json
          specs: Json
          description: string | null
          short_description: string | null
          meta_title: string | null
          meta_description: string | null
          meta_keywords: string[] | null
          status: string
          is_featured: boolean
          view_count: number
          compare_count: number
          source: string
          source_url: string | null
          last_scraped_at: string | null
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          category_id: string
          segment_id?: string | null
          name: string
          slug: string
          brand?: string | null
          model?: string | null
          model_year?: number | null
          price_min?: number | null
          price_max?: number | null
          currency?: string
          image_url?: string | null
          images?: Json
          specs?: Json
          description?: string | null
          short_description?: string | null
          meta_title?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          status?: string
          is_featured?: boolean
          view_count?: number
          compare_count?: number
          source?: string
          source_url?: string | null
          last_scraped_at?: string | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          category_id?: string
          segment_id?: string | null
          name?: string
          slug?: string
          brand?: string | null
          model?: string | null
          model_year?: number | null
          price_min?: number | null
          price_max?: number | null
          currency?: string
          image_url?: string | null
          images?: Json
          specs?: Json
          description?: string | null
          short_description?: string | null
          meta_title?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          status?: string
          is_featured?: boolean
          view_count?: number
          compare_count?: number
          source?: string
          source_url?: string | null
          last_scraped_at?: string | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
      }
      news_articles: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string | null
          content: string
          cover_image: string | null
          images: string[] | null
          category: string | null
          categories: string[] | null
          tags: string[] | null
          related_product_ids: string[] | null
          meta_title: string | null
          meta_description: string | null
          source: string
          source_url: string | null
          author: string | null
          status: string
          is_featured: boolean
          view_count: number
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt?: string | null
          content: string
          cover_image?: string | null
          images?: string[] | null
          category?: string | null
          categories?: string[] | null
          tags?: string[] | null
          related_product_ids?: string[] | null
          meta_title?: string | null
          meta_description?: string | null
          source?: string
          source_url?: string | null
          author?: string | null
          status?: string
          is_featured?: boolean
          view_count?: number
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          excerpt?: string | null
          content?: string
          cover_image?: string | null
          images?: string[] | null
          category?: string | null
          categories?: string[] | null
          tags?: string[] | null
          related_product_ids?: string[] | null
          meta_title?: string | null
          meta_description?: string | null
          source?: string
          source_url?: string | null
          author?: string | null
          status?: string
          is_featured?: boolean
          view_count?: number
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_product_view: {
        Args: { product_uuid: string }
        Returns: undefined
      }
      increment_news_view: {
        Args: { article_uuid: string }
        Returns: undefined
      }
      increment_compare_count: {
        Args: { product_uuid: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Inserts<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type Updates<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// --- Derived helper types (used throughout the codebase) ---

export type ProductStatus = 'active' | 'inactive' | 'draft';

export type Category = Tables<'categories'>
export type CategoryInsert = Inserts<'categories'>
export type CategoryUpdate = Updates<'categories'>
export type CategoryInput = Omit<CategoryInsert, 'id' | 'created_at' | 'updated_at'>

export type Segment = Tables<'segments'>
export type SegmentInsert = Inserts<'segments'>
export type SegmentUpdate = Updates<'segments'>
export type SegmentInput = Omit<SegmentInsert, 'id' | 'created_at' | 'updated_at'>

export type Product = Tables<'products'>
export type ProductInsert = Inserts<'products'>
export type ProductUpdate = Updates<'products'>
export type ProductInput = Omit<ProductInsert, 'id' | 'created_at' | 'updated_at'>

// Comparison and UserFavorite — not in DB schema yet, kept for compatibility
export interface Comparison {
  id: string
  user_id: string | null
  product_ids: string[]
  created_at: string
}
export type ComparisonInsert = Omit<Comparison, 'id' | 'created_at'> & { id?: string; created_at?: string }
export type ComparisonUpdate = Partial<ComparisonInsert>

export interface UserFavorite {
  id: string
  user_id: string
  product_id: string
}
export type UserFavoriteInsert = Omit<UserFavorite, 'id'> & { id?: string }
export type UserFavoriteUpdate = Partial<UserFavoriteInsert>

// --- Query helpers ---
export interface PaginationParams {
  limit?: number
  offset?: number
}

export type SortBy = 'newest' | 'price_asc' | 'price_desc' | 'name_asc'

export interface ProductFilters extends PaginationParams {
  category?: string
  segment?: string
  minPrice?: number
  maxPrice?: number
  status?: ProductStatus
  search?: string
  sortBy?: SortBy
}
