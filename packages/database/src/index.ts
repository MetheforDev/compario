// Client
export { supabase, createAdminClient } from './client';

// Types
export type {
  Database,
  Json,
  ProductStatus,
  Category,
  CategoryInsert,
  CategoryUpdate,
  CategoryInput,
  Segment,
  SegmentInsert,
  SegmentUpdate,
  SegmentInput,
  Product,
  ProductInsert,
  ProductUpdate,
  ProductInput,
  Comparison,
  ComparisonInsert,
  ComparisonUpdate,
  UserFavorite,
  UserFavoriteInsert,
  UserFavoriteUpdate,
  PaginationParams,
  ProductFilters,
  SortBy,
} from './types';

// Product queries
export {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  incrementViewCount,
} from './queries/products';

// Category queries
export {
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from './queries/categories';

// Segment queries
export {
  getAllSegments,
  getSegmentsByCategory,
  getSegmentBySlug,
  createSegment,
  updateSegment,
  deleteSegment,
} from './queries/segments';

// News queries
export type { NewsArticle, NewsArticleInput, NewsFilters } from './queries/news';
export {
  getNewsArticlesAdmin,
  getNewsArticles,
  getNewsArticleBySlug,
  getNewsArticleById,
  createNewsArticle,
  updateNewsArticle,
  deleteNewsArticle,
  incrementNewsView,
  getFeaturedNews,
  getRelatedNews,
} from './queries/news';
