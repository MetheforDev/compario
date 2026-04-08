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
  getProductsByIds,
  createProduct,
  updateProduct,
  deleteProduct,
  incrementViewCount,
  incrementCompareCount,
  getTrendingProducts,
  getTopProductsByViews,
  getTopProductsByCompares,
  bulkCreateProducts,
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

// Newsletter queries
export type { NewsletterSubscriber, NewsletterSubscriberInsert } from './types';
export {
  subscribeNewsletter,
  getNewsletterSubscribers,
  getSubscriberCount,
  unsubscribeNewsletter,
  deleteSubscriber,
} from './queries/newsletter';

// Review queries
export type { RatingSummary } from './queries/reviews';
export type { Review, ReviewInsert, ReviewUpdate, ReviewStatus } from './types';
export {
  getApprovedReviews,
  getRatingSummary,
  createReview,
  incrementHelpful,
  getReviewsAdmin,
  updateReviewStatus,
  deleteReview,
} from './queries/reviews';

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
  getDailyComparison,
  getRelatedNews,
  getTopNewsByViews,
  publishScheduledArticles,
  getNewsForProduct,
} from './queries/news';

// Price queries
export type { PricePoint, PriceAlert } from './queries/prices';
export {
  getPriceHistory,
  recordPrice,
  recordDailyPrices,
  createPriceAlert,
  getActiveAlerts,
  deactivateAlert,
  unsubscribePriceAlert,
} from './queries/prices';
