# CompareHub - Development Roadmap for Claude Code

## 🎯 Bu Dokümanda Ne Var?

Bu roadmap, Claude Code ile geliştirmeye başladığınızda takip edeceğiniz adım adım rehberdir. Her task için:
- ✅ Checklist
- 📝 İşlem adımları
- 🎨 UI/UX notları
- 🔧 Teknik detaylar
- ⚠️ Dikkat edilmesi gerekenler

---

## 📊 Genel İlerleme Takibi

```
┌─────────────────────────────────────────────────────────┐
│ PHASE 1: Foundation (Week 1-2)                    [▓▓░░] │
│ PHASE 2: Core Features (Week 3-4)                 [░░░░] │
│ PHASE 3: Advanced Features (Week 5-6)             [░░░░] │
│ PHASE 4: Polish & Launch (Week 7-8)               [░░░░] │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 PHASE 1: Foundation (Week 1-2)

### Day 1-2: Database Setup

#### ✅ Checklist
- [ ] Supabase account oluştur
- [ ] Yeni proje başlat (Region: Frankfurt)
- [ ] DATABASE_SETUP.md'deki tüm SQL scriptleri çalıştır
- [ ] Test data seed et
- [ ] Connection string'leri kaydet
- [ ] RLS policies test et

#### 📝 Adımlar
```bash
# 1. Supabase Dashboard
https://supabase.com/dashboard

# 2. New Project
Name: ComparHub
Database Password: [GÜÇLÜ ŞİFRE - KayDET!]
Region: Frankfurt

# 3. SQL Editor'e git
# DATABASE_SETUP.md'den sırasıyla:
- Tables
- Indexes
- RLS Policies
- Functions & Triggers
- Views
- Seed Data

# 4. Test Query
SELECT * FROM categories;
SELECT * FROM products;

# 5. API Keys al
Settings > API > Copy keys to .env
```

#### ⚠️ Önemli Notlar
- Database password'ü kaydet, bir daha göremezsin!
- RLS policies çalıştırmayı unutma, yoksa security açığı olur
- Seed data başarılı çalıştı mı test et

---

### Day 3-4: Project Initialization

#### ✅ Checklist
- [ ] Monorepo structure oluştur
- [ ] Root package.json setup
- [ ] Turborepo config
- [ ] Git initialize
- [ ] .env dosyaları oluştur
- [ ] GitHub repo create & push

#### 📝 Adımlar
```bash
# 1. Create project
mkdir comparehub && cd comparehub
git init

# 2. Copy PROJECT_STRUCTURE.md'deki folder structure
mkdir -p apps/{web,mobile} packages/{database,ui} services/scraper scripts

# 3. Root package.json
# PROJECT_STRUCTURE.md'den kopyala

# 4. Install root dependencies
npm install

# 5. Create .env files
cp .env.example .env.local

# 6. Git setup
echo "node_modules/
.env*
.next/
dist/
build/" > .gitignore

git add .
git commit -m "Initial commit: Project structure"

# 7. GitHub
# Create repo on GitHub
git remote add origin https://github.com/Methefor/comparehub.git
git push -u origin main
```

---

### Day 5-7: Database Package

Bu kritik! Tüm proje bu package'i kullanacak.

#### ✅ Checklist
- [ ] Supabase client wrapper oluştur
- [ ] TypeScript types generate et
- [ ] Query helper functions yaz
- [ ] Error handling ekle
- [ ] Test utilities oluştur

#### 📝 Files to Create

**packages/database/src/client.ts**
```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Server-side client with service key
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

**packages/database/src/queries/products.ts**
```typescript
import { supabase } from '../client'
import type { Database } from '../types'

type Product = Database['public']['Tables']['products']['Row']

export async function getProducts(filters: {
  category?: string
  segment?: string
  minPrice?: number
  maxPrice?: number
  status?: string
  limit?: number
  offset?: number
}) {
  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      segment:segments(*)
    `)
  
  if (filters.category) {
    query = query.eq('category_id', filters.category)
  }
  
  if (filters.segment) {
    query = query.eq('segment_id', filters.segment)
  }
  
  if (filters.minPrice) {
    query = query.gte('price_min', filters.minPrice)
  }
  
  if (filters.maxPrice) {
    query = query.lte('price_max', filters.maxPrice)
  }
  
  if (filters.status) {
    query = query.eq('status', filters.status)
  } else {
    query = query.eq('status', 'active')
  }
  
  query = query
    .order('created_at', { ascending: false })
    .range(filters.offset || 0, (filters.offset || 0) + (filters.limit || 20) - 1)
  
  const { data, error } = await query
  
  if (error) throw error
  return data
}

export async function getProductBySlug(slug: string) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      segment:segments(*)
    `)
    .eq('slug', slug)
    .single()
  
  if (error) throw error
  return data
}

// Add more query functions...
```

**packages/database/src/index.ts**
```typescript
export * from './client'
export * from './types'
export * from './queries/products'
export * from './queries/categories'
export * from './queries/segments'
export * from './queries/comparisons'
```

#### 🎯 Generate Types
```bash
cd packages/database

# Generate types from Supabase
supabase gen types typescript --project-id YOUR_PROJECT_REF > src/types.ts

# Test
npm run build
```

---

### Day 8-10: Next.js Web App - Basic Setup

#### ✅ Checklist
- [ ] Next.js 14 initialize
- [ ] Tailwind CSS setup
- [ ] Layout structure
- [ ] Authentication setup
- [ ] Basic routing

#### 📝 Adımlar
```bash
cd apps/web

# Initialize Next.js
npx create-next-app@latest . --typescript --tailwind --app

# Install dependencies
npm install @supabase/auth-helpers-nextjs @supabase/supabase-js
npm install database@*
npm install lucide-react class-variance-authority clsx tailwind-merge
npm install zustand react-hot-toast
```

**app/layout.tsx**
```typescript
import './globals.css'
import { Orbitron, JetBrains_Mono } from 'next/font/google'

const orbitron = Orbitron({ 
  subsets: ['latin'],
  variable: '--font-orbitron'
})

const jetbrains = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono'
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" className={`${orbitron.variable} ${jetbrains.variable}`}>
      <body className="bg-[#0a0a0f] text-white">
        {children}
      </body>
    </html>
  )
}
```

**tailwind.config.js**
```javascript
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'neon-cyan': '#00fff7',
        'neon-purple': '#b724ff',
        'neon-green': '#39ff14',
        'neon-pink': '#ff006e',
      },
      fontFamily: {
        orbitron: ['var(--font-orbitron)'],
        mono: ['var(--font-mono)'],
      },
    },
  },
}
```

---

## 🔥 PHASE 2: Core Features (Week 3-4)

### Week 3: Admin Panel

Bu kısım için admin-panel.html'i React component'lere dönüştüreceğiz.

#### ✅ Checklist - Day 11-12: Dashboard
- [ ] Dashboard layout component
- [ ] Stat cards component
- [ ] Recent products table
- [ ] Charts integration (recharts)
- [ ] Real-time data fetch

#### ✅ Checklist - Day 13-14: Product Management
- [ ] Product list page
- [ ] Product form component (add/edit)
- [ ] Image upload functionality
- [ ] Specs editor (dynamic JSONB)
- [ ] Validation with Zod

#### ✅ Checklist - Day 15-16: Category & Segment Management
- [ ] Category CRUD pages
- [ ] Segment CRUD pages
- [ ] Drag-drop ordering (optional)
- [ ] Bulk operations

#### 📝 Example: Dashboard Page
```typescript
// app/(admin)/admin/dashboard/page.tsx
import { supabase } from 'database'
import StatsGrid from '@/components/admin/StatsGrid'
import RecentProducts from '@/components/admin/RecentProducts'

export default async function AdminDashboard() {
  // Fetch stats
  const [productsData, categoriesData, comparisonsData] = await Promise.all([
    supabase.from('products').select('count', { count: 'exact', head: true }),
    supabase.from('categories').select('count', { count: 'exact', head: true }),
    supabase.from('comparisons').select('count', { count: 'exact', head: true }),
  ])

  const stats = {
    products: productsData.count || 0,
    categories: categoriesData.count || 0,
    comparisons: comparisonsData.count || 0,
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-orbitron text-neon-cyan mb-8">
        Dashboard
      </h1>
      
      <StatsGrid stats={stats} />
      <RecentProducts />
    </div>
  )
}
```

---

### Week 4: Public-Facing Features

#### ✅ Checklist - Day 17-18: Homepage & Product Listing
- [ ] Landing page design
- [ ] Category cards
- [ ] Product grid component
- [ ] Filtering UI
- [ ] Pagination
- [ ] Search functionality

#### ✅ Checklist - Day 19-20: Product Detail & Compare
- [ ] Product detail page
- [ ] Spec display component
- [ ] "Add to compare" functionality
- [ ] Compare sidebar/modal
- [ ] Compare page (side-by-side)

#### 📝 Example: Product Grid Component
```typescript
// components/product/ProductGrid.tsx
'use client'

import { useState, useEffect } from 'react'
import { getProducts } from 'database'
import ProductCard from './ProductCard'

export default function ProductGrid({ 
  categorySlug,
  segmentSlug 
}: {
  categorySlug?: string
  segmentSlug?: string
}) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await getProducts({
          category: categorySlug,
          segment: segmentSlug,
          limit: 20
        })
        setProducts(data)
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [categorySlug, segmentSlug])

  if (loading) return <LoadingGrid />

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

---

## 🚁 PHASE 3: Advanced Features (Week 5-6)

### Week 5: Scraper Service

#### ✅ Checklist - Day 21-23: Scraper Foundation
- [ ] Puppeteer setup
- [ ] Base scraper class
- [ ] Arabam.com scraper
- [ ] Sahibinden.com scraper
- [ ] Error handling & retry logic

#### ✅ Checklist - Day 24-25: Scraper Management
- [ ] Cron job setup
- [ ] Admin UI for scraper control
- [ ] Log viewer
- [ ] Manual trigger
- [ ] Webhook notifications

#### 📝 Example: Arabam Scraper
```typescript
// services/scraper/src/scrapers/arabam.ts
import puppeteer from 'puppeteer'
import { supabaseAdmin } from 'database'

export async function scrapeArabam(config: ScraperConfig) {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  
  try {
    await page.goto(config.target_url)
    
    // Wait for products to load
    await page.waitForSelector('.listing-item')
    
    // Extract product data
    const products = await page.evaluate(() => {
      const items = document.querySelectorAll('.listing-item')
      
      return Array.from(items).map(item => ({
        name: item.querySelector('.title')?.textContent?.trim(),
        price: item.querySelector('.price')?.textContent?.trim(),
        image: item.querySelector('img')?.src,
        link: item.querySelector('a')?.href,
      }))
    })
    
    // Process and save to database
    for (const product of products) {
      await saveOrUpdateProduct(product, config.category_id)
    }
    
    return {
      success: true,
      count: products.length
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  } finally {
    await browser.close()
  }
}
```

---

### Week 6: Mobile App (React Native)

#### ✅ Checklist - Day 26-27: Setup & Navigation
- [ ] Expo initialize
- [ ] React Navigation setup
- [ ] Authentication flow
- [ ] Tab navigation
- [ ] Stack navigation

#### ✅ Checklist - Day 28-30: Core Screens
- [ ] Home screen
- [ ] Product list
- [ ] Product detail
- [ ] Compare screen
- [ ] Profile/Settings

#### 📝 Note
Mobile app web app'in mirror'ı olacak. Aynı database package'i kullan, aynı logic.

---

## 💎 PHASE 4: Polish & Launch (Week 7-8)

### Week 7: Optimization & Testing

#### ✅ Checklist
- [ ] Performance optimization
  - [ ] Image optimization (next/image)
  - [ ] Code splitting
  - [ ] Lazy loading
  - [ ] Caching strategies
- [ ] SEO
  - [ ] Meta tags
  - [ ] Sitemap
  - [ ] Structured data
  - [ ] robots.txt
- [ ] Accessibility
  - [ ] Keyboard navigation
  - [ ] Screen reader support
  - [ ] Color contrast
- [ ] Testing
  - [ ] Unit tests (key functions)
  - [ ] E2E tests (critical paths)
  - [ ] Load testing
  - [ ] Mobile responsiveness

---

### Week 8: Deployment & Launch

#### ✅ Checklist - Deployment
- [ ] Domain satın al (methefor.dev?)
- [ ] Vercel deploy (web)
- [ ] EAS build & submit (mobile)
- [ ] Environment variables production
- [ ] Database backup strategy
- [ ] Monitoring setup (Sentry?)

#### ✅ Checklist - Launch
- [ ] Beta test (5-10 kişi)
- [ ] Feedback toplama
- [ ] Bug fixes
- [ ] Final polish
- [ ] Social media announce
- [ ] Product Hunt submit?

---

## 📊 Progress Tracking

Her gün sonunda bu tabloyu güncelle:

```markdown
## Daily Log

### Day 1 (DD/MM/YYYY)
- [x] Supabase account created
- [x] Database schema executed
- [x] Test data seeded
- [ ] RLS policies tested (TODO: test with non-admin user)

**Issues:**
- RLS policy for categories not working correctly
- Need to add unique constraint on product slugs

**Tomorrow:**
- Fix RLS policies
- Start project initialization
```

---

## 🎯 Kritik Başarı Faktörleri

### Must-Have Features (Launch için gerekli)
1. ✅ Product listing with filters
2. ✅ Product comparison (min 2, max 4 products)
3. ✅ Admin panel (CRUD operations)
4. ✅ Responsive design
5. ✅ Basic SEO

### Nice-to-Have (Post-launch)
1. 🔄 User accounts & favorites
2. 🔄 AI-powered recommendations
3. 🔄 Price tracking & alerts
4. 🔄 Social sharing
5. 🔄 Multiple scrapers
6. 🔄 Advanced analytics

---

## 🚨 Common Pitfalls & Solutions

### Problem: Supabase RLS çalışmıyor
**Solution:** 
- RLS policies'i SQL Editor'de tek tek test et
- `auth.uid()` ve `auth.role()` functions çalışıyor mu kontrol et
- Admin için bypass policy ekle: `role = 'admin'`

### Problem: Type errors with database package
**Solution:**
- `npm run db:types` çalıştır (types güncelle)
- tsconfig.json'da paths ayarını kontrol et

### Problem: Scraper blocked by website
**Solution:**
- User-Agent header ekle
- Request interval'i artır (1-2 saniye bekle)
- Proxy kullan (gerekirse)

---

## 📚 Resources for Claude Code

Claude Code ile çalışırken faydalı olacak komutlar:

```bash
# Database types generate
npm run db:types

# Development
npm run dev:web        # Web app
npm run dev:mobile     # Mobile app
npm run dev:scraper    # Scraper service

# Testing
npm test

# Build
npm run build:web

# Deploy
vercel deploy          # Web
eas build --platform all  # Mobile
```

---

## 🎉 Launch Checklist

Son kontroller:

- [ ] Database backup alındı mı?
- [ ] Production env variables set edildi mi?
- [ ] SSL certificate aktif mi?
- [ ] Error tracking (Sentry) çalışıyor mu?
- [ ] Analytics (GA) kurulu mu?
- [ ] Domain DNS ayarları yapıldı mı?
- [ ] Email setup tamamlandı mı? (Supabase Auth)
- [ ] Terms of Service & Privacy Policy var mı?
- [ ] KVKK uyumlu mu?
- [ ] Contact form/email var mı?

---

## 💪 Motivasyon

Bu roadmap'i tamamladığınızda:
- ✅ Full-stack production app
- ✅ Admin panel
- ✅ Mobile app
- ✅ Automated scraping system
- ✅ Scalable architecture

**CompareHub Türkiye'nin en iyi karşılaştırma platformu olacak! 🚀**

Good luck, Metehan! Bu dokümanda her şey hazır. Claude Code ile bu planı takip edince harika bir ürün çıkacak. 

Sorularınız olursa yine buradayım! 💙
