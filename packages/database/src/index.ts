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
export type { SearchProductResult } from './queries/products';
export {
  getProducts,
  getProductById,
  getProductBySlug,
  getProductsByIds,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  incrementViewCount,
  getSimilarProducts,
  incrementCompareCount,
  getTrendingProducts,
  getTopProductsByViews,
  getTopProductsByCompares,
  bulkCreateProducts,
  getBrandsByCategory,
} from './queries/products';

// Category queries
export type { CategoryWithChildren } from './queries/categories';
export {
  getCategories,
  getTopLevelCategories,
  getSubCategories,
  getCategoryTree,
  getCategoryById,
  getCategoryBySlug,
  getProductCountsByCategory,
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
  getAdjacentNews,
  getTopNewsByViews,
  publishScheduledArticles,
  getNewsForProduct,
  searchNews,
} from './queries/news';

// User profiles
export type { UserProfile } from './queries/profiles';
export { getUserProfile, upsertUserProfile } from './queries/profiles';

// Favorites & user queries
export {
  getUserFavorites,
  addFavorite,
  removeFavorite,
  isFavorite,
  getUserPriceAlerts,
} from './queries/favorites';

// Comments
export type { Comment, CommentStatus } from './queries/comments';
export {
  getComments,
  getCommentCount,
  getUserCommentCount,
  createComment,
  incrementCommentHelpful,
  getCommentsAdmin,
  updateCommentStatus,
  deleteComment,
} from './queries/comments';

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
