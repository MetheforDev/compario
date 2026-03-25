# CompareHub - API Documentation

## 🔗 Base URL
```
Development: http://localhost:3000/api
Production: https://comparehub.com/api
```

---

## 🔐 Authentication

All admin endpoints require authentication via Supabase JWT token.

### Headers
```
Authorization: Bearer <supabase_jwt_token>
Content-Type: application/json
```

---

## 📦 Products API

### GET /api/products
Get all products with filters

**Query Parameters:**
```typescript
{
  category?: string        // Category slug
  segment?: string         // Segment slug
  min_price?: number
  max_price?: number
  brand?: string
  search?: string          // Full-text search
  status?: 'active' | 'draft' | 'archived'
  sort?: 'price_asc' | 'price_desc' | 'popular' | 'newest'
  page?: number           // Default: 1
  limit?: number          // Default: 20, Max: 100
}
```

**Response:**
```typescript
{
  data: Product[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

**Example:**
```bash
GET /api/products?category=araclar&segment=suv&min_price=800000&max_price=1500000&sort=price_asc
```

---

### GET /api/products/:slug
Get single product by slug

**Response:**
```typescript
{
  id: string,
  name: string,
  slug: string,
  brand: string,
  model: string,
  model_year: number,
  price_min: number,
  price_max: number,
  currency: string,
  image_url: string,
  images: string[],
  specs: {
    [key: string]: any  // Flexible specs based on category
  },
  description: string,
  short_description: string,
  category: {
    id: string,
    name: string,
    slug: string
  },
  segment: {
    id: string,
    name: string,
    slug: string
  },
  view_count: number,
  compare_count: number,
  created_at: string,
  updated_at: string
}
```

---

### POST /api/products (Admin Only)
Create new product

**Request Body:**
```typescript
{
  category_id: string,      // Required
  segment_id?: string,
  name: string,             // Required
  slug: string,             // Required, unique
  brand?: string,
  model?: string,
  model_year?: number,
  price_min?: number,
  price_max?: number,
  currency?: string,        // Default: 'TRY'
  image_url?: string,
  images?: string[],
  specs?: object,
  description?: string,
  short_description?: string,
  status?: 'draft' | 'active' | 'archived',
  source?: 'manual' | 'scraped' | 'api'
}
```

**Response:**
```typescript
{
  success: true,
  data: Product
}
```

---

### PATCH /api/products/:id (Admin Only)
Update product

**Request Body:** Same as POST, all fields optional

**Response:**
```typescript
{
  success: true,
  data: Product
}
```

---

### DELETE /api/products/:id (Admin Only)
Delete product (soft delete - sets status to 'archived')

**Response:**
```typescript
{
  success: true,
  message: "Product archived successfully"
}
```

---

## 🏷️ Categories API

### GET /api/categories
Get all categories

**Query Parameters:**
```typescript
{
  is_active?: boolean  // Default: true
}
```

**Response:**
```typescript
{
  data: [
    {
      id: string,
      name: string,
      slug: string,
      icon: string,
      description: string,
      display_order: number,
      is_active: boolean,
      product_count: number  // Computed
    }
  ]
}
```

---

### GET /api/categories/:slug
Get single category with segments

**Response:**
```typescript
{
  id: string,
  name: string,
  slug: string,
  icon: string,
  description: string,
  segments: [
    {
      id: string,
      name: string,
      slug: string,
      price_min: number,
      price_max: number,
      product_count: number
    }
  ]
}
```

---

### POST /api/categories (Admin Only)
Create category

**Request Body:**
```typescript
{
  name: string,         // Required
  slug: string,         // Required, unique
  icon?: string,
  description?: string,
  display_order?: number
}
```

---

### PATCH /api/categories/:id (Admin Only)
Update category

---

### DELETE /api/categories/:id (Admin Only)
Delete category (only if no products)

---

## 🎯 Segments API

### GET /api/segments
Get all segments

**Query Parameters:**
```typescript
{
  category_id?: string,
  is_active?: boolean
}
```

---

### POST /api/segments (Admin Only)
Create segment

**Request Body:**
```typescript
{
  category_id: string,    // Required
  name: string,          // Required
  slug: string,          // Required
  description?: string,
  price_min?: number,
  price_max?: number,
  display_order?: number
}
```

---

## ⚖️ Compare API

### POST /api/compare
Create comparison

**Request Body:**
```typescript
{
  product_ids: string[],  // 2-10 products
  session_id?: string     // For anonymous users
}
```

**Response:**
```typescript
{
  id: string,
  products: Product[],
  created_at: string
}
```

---

### GET /api/compare/:id
Get comparison details

**Response:**
```typescript
{
  id: string,
  products: [
    {
      ...Product,
      specs_normalized: {
        // All products' specs normalized for comparison
      }
    }
  ],
  comparison_matrix: {
    // Side-by-side comparison data
  }
}
```

---

### GET /api/compare/my
Get user's comparison history (requires auth)

**Response:**
```typescript
{
  data: [
    {
      id: string,
      product_count: number,
      category: string,
      created_at: string,
      products: Product[]  // Preview
    }
  ]
}
```

---

## ⭐ Favorites API

### POST /api/favorites (Auth Required)
Add to favorites

**Request Body:**
```typescript
{
  product_id: string
}
```

---

### DELETE /api/favorites/:product_id (Auth Required)
Remove from favorites

---

### GET /api/favorites (Auth Required)
Get user's favorites

**Response:**
```typescript
{
  data: Product[]
}
```

---

## 🤖 Scraper API (Admin Only)

### GET /api/admin/scrapers
Get all scraper configs

**Response:**
```typescript
{
  data: [
    {
      id: string,
      name: string,
      target_url: string,
      category: {
        id: string,
        name: string
      },
      is_active: boolean,
      last_run_at: string,
      last_success_at: string,
      total_runs: number,
      total_products_scraped: number
    }
  ]
}
```

---

### POST /api/admin/scrapers
Create scraper config

**Request Body:**
```typescript
{
  name: string,
  target_url: string,
  category_id: string,
  selectors: {
    product_list: string,      // CSS selector for product list
    product_name: string,
    product_price: string,
    product_image: string,
    product_link: string,
    // ... more selectors based on category
  },
  schedule?: string,  // Cron expression, default: '0 3 * * *'
  is_active?: boolean
}
```

---

### POST /api/admin/scrapers/:id/run
Trigger scraper run manually

**Response:**
```typescript
{
  success: true,
  message: "Scraper started",
  job_id: string
}
```

---

### GET /api/admin/scrapers/:id/logs
Get scraper logs

**Query Parameters:**
```typescript
{
  limit?: number,
  status?: 'running' | 'success' | 'failed'
}
```

**Response:**
```typescript
{
  data: [
    {
      id: string,
      status: string,
      products_found: number,
      products_updated: number,
      products_created: number,
      error_message?: string,
      execution_time_ms: number,
      created_at: string
    }
  ]
}
```

---

## 📊 Analytics API (Admin Only)

### GET /api/admin/stats
Get dashboard statistics

**Response:**
```typescript
{
  products: {
    total: number,
    active: number,
    draft: number,
    by_category: {
      [category_name: string]: number
    }
  },
  comparisons: {
    total: number,
    today: number,
    this_week: number,
    this_month: number
  },
  users: {
    total: number,
    active_today: number,
    new_this_week: number
  },
  popular_products: [
    {
      product: Product,
      popularity_score: number
    }
  ]
}
```

---

### GET /api/admin/stats/products
Product-specific analytics

**Query Parameters:**
```typescript
{
  period?: '7d' | '30d' | '90d' | 'all',
  category_id?: string
}
```

**Response:**
```typescript
{
  views_over_time: [
    { date: string, views: number }
  ],
  comparisons_over_time: [
    { date: string, comparisons: number }
  ],
  top_viewed: Product[],
  top_compared: Product[]
}
```

---

## 🔍 Search API

### GET /api/search
Global search across products

**Query Parameters:**
```typescript
{
  q: string,              // Search query
  category?: string,      // Filter by category
  type?: 'all' | 'products' | 'brands',
  limit?: number          // Default: 10
}
```

**Response:**
```typescript
{
  products: Product[],
  brands: [
    { name: string, product_count: number }
  ],
  suggestions: string[]
}
```

---

## 📸 Image Upload API (Admin Only)

### POST /api/admin/upload/image
Upload product image to Supabase Storage

**Request:** multipart/form-data
```typescript
{
  file: File,           // Max 5MB, jpg/png/webp
  product_id?: string   // Optional, for organization
}
```

**Response:**
```typescript
{
  success: true,
  url: string,          // Public URL
  path: string          // Storage path
}
```

---

## 🚨 Error Responses

All endpoints return errors in this format:

```typescript
{
  error: {
    message: string,
    code: string,
    details?: any
  }
}
```

**Common Error Codes:**
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate slug, etc.)
- `422` - Unprocessable Entity (business logic error)
- `500` - Internal Server Error

---

## 🔄 Rate Limits

- **Public endpoints:** 100 requests/minute per IP
- **Authenticated endpoints:** 1000 requests/minute per user
- **Admin endpoints:** 5000 requests/minute per user

**Rate limit headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1703001234
```

---

## 📝 Example Usage (JavaScript)

### Fetch products
```javascript
const response = await fetch('/api/products?category=araclar&segment=suv', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
});

const { data, pagination } = await response.json();
```

---

### Create product (admin)
```javascript
const response = await fetch('/api/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${supabaseToken}`
  },
  body: JSON.stringify({
    category_id: 'uuid-here',
    name: 'Kia Sportage 1.6 T-GDI',
    slug: 'kia-sportage-1-6-t-gdi',
    brand: 'Kia',
    model: 'Sportage',
    model_year: 2024,
    price_min: 1250000,
    specs: {
      motor: {
        hacim: '1.6 T-GDI',
        guc: '180 HP'
      }
    },
    status: 'active'
  })
});

const { data } = await response.json();
```

---

### Compare products
```javascript
const response = await fetch('/api/compare', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    product_ids: ['uuid-1', 'uuid-2', 'uuid-3']
  })
});

const comparison = await response.json();
```

---

## 🔗 Webhooks (Future)

### Product updated webhook
```
POST https://your-app.com/webhook/product-updated
```

**Payload:**
```typescript
{
  event: 'product.updated',
  timestamp: string,
  data: Product
}
```

---

## 📚 API Client Libraries

### TypeScript/JavaScript
```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from 'database/types'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Query products
const { data: products } = await supabase
  .from('products')
  .select('*, category:categories(*), segment:segments(*)')
  .eq('status', 'active')
  .order('created_at', { ascending: false })
  .range(0, 19)
```

---

## 🎯 Implementation Priority

### Phase 1 (MVP)
1. ✅ Products CRUD
2. ✅ Categories & Segments
3. ✅ Compare endpoint
4. ✅ Search

### Phase 2
1. ✅ Favorites
2. ✅ User history
3. ✅ Analytics (basic)

### Phase 3
1. ✅ Scraper management
2. ✅ Advanced analytics
3. ✅ Image upload
4. ✅ Webhooks

---

## 🔐 Security Best Practices

1. **Always use RLS** - Never bypass Supabase RLS
2. **Validate inputs** - Use Zod or similar
3. **Rate limiting** - Implement on all endpoints
4. **CORS** - Restrict to your domains
5. **API keys** - Rotate regularly
6. **Logs** - Monitor suspicious activity

---

## 📞 Support

Bu API dokümantasyonu Claude Code ile geliştirme yaparken referans olarak kullanılacak. Her endpoint için implementation examples ve best practices içerir.
