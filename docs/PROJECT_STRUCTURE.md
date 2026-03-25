# CompareHub - Project Structure & Setup

## 📁 Monorepo Structure

```
comparehub/
├── apps/
│   ├── web/                    # Next.js web app
│   │   ├── src/
│   │   │   ├── app/           # App Router
│   │   │   │   ├── (public)/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── compare/
│   │   │   │   │   ├── products/
│   │   │   │   │   └── categories/
│   │   │   │   ├── (admin)/
│   │   │   │   │   └── admin/
│   │   │   │   │       ├── dashboard/
│   │   │   │   │       ├── products/
│   │   │   │   │       ├── categories/
│   │   │   │   │       └── segments/
│   │   │   │   └── api/
│   │   │   │       └── [...all endpoints]
│   │   │   ├── components/
│   │   │   │   ├── ui/        # shadcn/ui components
│   │   │   │   ├── product/
│   │   │   │   ├── compare/
│   │   │   │   └── admin/
│   │   │   ├── lib/
│   │   │   │   ├── supabase/
│   │   │   │   ├── utils/
│   │   │   │   └── hooks/
│   │   │   └── styles/
│   │   ├── public/
│   │   ├── package.json
│   │   └── next.config.js
│   │
│   ├── mobile/                 # React Native app
│   │   ├── src/
│   │   │   ├── screens/
│   │   │   ├── components/
│   │   │   ├── navigation/
│   │   │   ├── services/
│   │   │   └── utils/
│   │   ├── app.json
│   │   └── package.json
│   │
│   └── admin/                  # Separate admin dashboard (optional)
│       └── [same structure as web]
│
├── packages/
│   ├── database/              # Supabase client & types
│   │   ├── src/
│   │   │   ├── client.ts
│   │   │   ├── types.ts      # Generated from Supabase
│   │   │   └── queries/
│   │   │       ├── products.ts
│   │   │       ├── categories.ts
│   │   │       └── comparisons.ts
│   │   └── package.json
│   │
│   ├── ui/                    # Shared UI components
│   │   ├── src/
│   │   │   └── components/
│   │   └── package.json
│   │
│   └── config/                # Shared configs
│       ├── eslint-config/
│       ├── typescript-config/
│       └── tailwind-config/
│
├── services/
│   ├── scraper/               # Scraping service
│   │   ├── src/
│   │   │   ├── scrapers/
│   │   │   │   ├── arabam.ts
│   │   │   │   ├── sahibinden.ts
│   │   │   │   └── hepsiburada.ts
│   │   │   ├── scheduler.ts
│   │   │   ├── parser.ts
│   │   │   └── index.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── image-optimizer/       # Image processing
│       └── [Cloudflare Worker or similar]
│
├── scripts/
│   ├── seed-db.ts            # Database seeding
│   ├── generate-types.ts     # Supabase type generation
│   └── migrate.ts            # Migration runner
│
├── .github/
│   └── workflows/
│       ├── deploy-web.yml
│       ├── deploy-scraper.yml
│       └── test.yml
│
├── package.json              # Root package.json
├── turbo.json                # Turborepo config
├── .env.example
└── README.md
```

---

## 🔧 Environment Variables

### `.env.example`
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Admin
ADMIN_EMAIL=metehan@comparehub.com

# Scraper Service
SCRAPER_API_KEY=your-scraper-api-key
SCRAPER_WEBHOOK_SECRET=your-webhook-secret

# External APIs (optional)
RAPID_API_KEY=your-rapidapi-key

# Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Email (optional - Supabase Auth already handles this)
RESEND_API_KEY=your-resend-key

# Image Storage
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_R2_ACCESS_KEY=your-access-key
CLOUDFLARE_R2_SECRET_KEY=your-secret-key
CLOUDFLARE_R2_BUCKET=comparehub-images
```

---

## 📦 Package.json (Root)

```json
{
  "name": "comparehub",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*",
    "services/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "dev:web": "turbo run dev --filter=web",
    "dev:mobile": "turbo run dev --filter=mobile",
    "dev:scraper": "turbo run dev --filter=scraper",
    "build": "turbo run build",
    "build:web": "turbo run build --filter=web",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{ts,tsx,md}\"",
    "db:types": "supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > packages/database/src/types.ts",
    "db:seed": "tsx scripts/seed-db.ts",
    "db:migrate": "tsx scripts/migrate.ts"
  },
  "devDependencies": {
    "@turbo/gen": "^1.11.2",
    "prettier": "^3.1.1",
    "tsx": "^4.7.0",
    "turbo": "^1.11.2",
    "typescript": "^5.3.3"
  }
}
```

---

## 📦 apps/web/package.json

```json
{
  "name": "web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.39.0",
    "@supabase/auth-helpers-nextjs": "^0.8.7",
    "database": "*",
    "ui": "*",
    
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    
    "lucide-react": "^0.303.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    
    "zustand": "^4.4.7",
    "react-hot-toast": "^2.4.1",
    "framer-motion": "^10.16.16",
    
    "recharts": "^2.10.3",
    "date-fns": "^3.0.6"
  },
  "devDependencies": {
    "@types/node": "^20.10.6",
    "@types/react": "^18.2.46",
    "@types/react-dom": "^18.2.18",
    "typescript": "^5.3.3",
    "eslint": "^8.56.0",
    "eslint-config-next": "^14.0.4"
  }
}
```

---

## 📦 apps/mobile/package.json

```json
{
  "name": "mobile",
  "version": "1.0.0",
  "main": "expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "build:android": "eas build --platform android",
    "build:ios": "eas build --platform ios"
  },
  "dependencies": {
    "expo": "~50.0.0",
    "react": "18.2.0",
    "react-native": "0.73.0",
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/stack": "^6.3.20",
    "@supabase/supabase-js": "^2.39.0",
    "database": "*",
    "react-native-safe-area-context": "4.8.2",
    "react-native-screens": "~3.29.0",
    "expo-secure-store": "~12.8.1",
    "expo-image": "~1.10.1"
  },
  "devDependencies": {
    "@babel/core": "^7.23.6",
    "@types/react": "~18.2.45",
    "typescript": "^5.3.3"
  }
}
```

---

## 📦 packages/database/package.json

```json
{
  "name": "database",
  "version": "0.0.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "generate-types": "supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > src/types.ts"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0"
  },
  "devDependencies": {
    "typescript": "^5.3.3"
  }
}
```

---

## 📦 services/scraper/package.json

```json
{
  "name": "scraper",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "start": "node dist/index.js",
    "build": "tsc",
    "scrape:arabam": "tsx src/scrapers/arabam.ts",
    "scrape:all": "tsx src/index.ts"
  },
  "dependencies": {
    "puppeteer": "^21.7.0",
    "cheerio": "^1.0.0-rc.12",
    "axios": "^1.6.5",
    "@supabase/supabase-js": "^2.39.0",
    "database": "*",
    "node-cron": "^3.0.3",
    "pino": "^8.17.2"
  },
  "devDependencies": {
    "@types/node": "^20.10.6",
    "@types/node-cron": "^3.0.11",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3"
  }
}
```

---

## 🚀 Quick Start Commands

### 1. Initialize Project
```bash
# Create project structure
mkdir comparehub && cd comparehub

# Initialize package.json
npm init -y

# Install dependencies
npm install -D turbo prettier typescript tsx

# Create workspace structure
mkdir -p apps/web apps/mobile packages/database services/scraper scripts
```

### 2. Setup Supabase
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Generate TypeScript types
npm run db:types
```

### 3. Start Development
```bash
# Install all dependencies
npm install

# Start web app
npm run dev:web

# Start mobile app (in another terminal)
npm run dev:mobile

# Start scraper service
npm run dev:scraper
```

---

## 🔐 First Admin User Setup

### Create first admin via Supabase Dashboard
```sql
-- 1. Sign up through your app first
-- 2. Then run this in Supabase SQL Editor:

UPDATE user_profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'metehan@comparehub.com'
);
```

---

## 📚 Tech Stack Summary

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui
- **State:** Zustand
- **Animation:** Framer Motion

### Mobile
- **Framework:** React Native + Expo
- **Navigation:** React Navigation

### Backend
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **API:** Next.js API Routes

### DevOps
- **Monorepo:** Turborepo
- **Deployment:** Vercel (web), EAS (mobile)
- **CI/CD:** GitHub Actions

---

## 🎯 Development Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/add-product-comparison
   ```

2. **Make changes in appropriate app/package**
   ```bash
   cd apps/web
   # Make changes
   ```

3. **Test locally**
   ```bash
   npm run dev:web
   npm run test
   ```

4. **Commit & Push**
   ```bash
   git add .
   git commit -m "feat: add product comparison feature"
   git push origin feature/add-product-comparison
   ```

5. **Create PR & Deploy**
   - PR to main → Auto-deploys preview
   - Merge → Auto-deploys production

---

## 📝 Next Steps with Claude Code

Bu hazırlıktan sonra Claude Code ile:

1. **Start with database package**
   ```bash
   cd packages/database
   # Create Supabase client wrapper
   # Create query helpers
   ```

2. **Then web app**
   ```bash
   cd apps/web
   # Create basic pages
   # Implement admin panel
   # Add comparison feature
   ```

3. **Then scraper**
   ```bash
   cd services/scraper
   # Implement first scraper (arabam.com)
   # Test and iterate
   ```

4. **Finally mobile**
   ```bash
   cd apps/mobile
   # Port web features to mobile
   # Add mobile-specific features
   ```

---

## 🔗 Useful Links

- **Next.js Docs:** https://nextjs.org/docs
- **Supabase Docs:** https://supabase.com/docs
- **Turborepo Docs:** https://turbo.build/repo/docs
- **shadcn/ui:** https://ui.shadcn.com
- **React Native:** https://reactnative.dev
