# Vercel Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Vercel CLI (`npm i -g vercel`)
- GitHub repository connected

## Environment Variables

قبل از deployment، این متغیرهای محیطی را در Vercel dashboard تنظیم کنید:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Local Build Test

```bash
npm run build
npm run preview
```

## Deploy to Vercel

### Option 1: Using Vercel CLI

```bash
vercel
```

### Option 2: Using GitHub Integration

1. Push your code to GitHub
2. Import project in Vercel dashboard
3. Select framework: Vite
4. Add environment variables
5. Deploy

## Project Configuration

### vercel.json Settings

- **Build Command**: `npm run build`
- **Dev Command**: `npm run dev`
- **Install Command**: `npm install`
- **Output Directory**: `dist`
- **Framework**: Vite
- **Runtime**: Node.js 18+

### Configuration Options

Vercel supports multiple configuration methods:

1. **vercel.json** (static JSON) - Main configuration file
2. **vercel.toml** (static TOML) - Alternative format
3. **vercel.ts** (TypeScript) - Dynamic configuration at build time

#### vercel.json Properties Used

| Property          | Value           | Description                         |
| ----------------- | --------------- | ----------------------------------- |
| `buildCommand`    | `npm run build` | Custom build command                |
| `devCommand`      | `npm run dev`   | Development server command          |
| `installCommand`  | `npm install`   | Package installation command        |
| `framework`       | `vite`          | Framework detection                 |
| `outputDirectory` | `dist`          | Build output location               |
| `rewrites`        | SPA routing     | Route all requests to index.html    |
| `headers`         | Caching rules   | Cache static assets (SVG, PNG, ICO) |

### Caching Strategy

```
/sw.js - Cache: public, max-age=0, must-revalidate (Service Worker)
/*.png - Cache: public, max-age=31536000, immutable (Images)
/*.svg - Cache: public, max-age=31536000, immutable (SVG Assets)
/favicon.ico - Cache: public, max-age=31536000, immutable (Favicon)
```

## Features Configured

✅ PWA Support (Service Worker)
✅ Optimized Caching Headers
✅ RTL Support (Persian/Farsi)
✅ Mobile-first Design
✅ Logo & Favicon Assets
✅ SPA Routing (Single Page Application)
✅ Image Optimization
✅ Automatic Framework Detection

## Post-Deployment

- Visit your Vercel deployment URL
- Install as PWA on mobile devices
- Enable notifications if needed

## Advanced Configuration Options

### Available in vercel.json/vercel.ts

- **cleanUrls** - Remove `.html` extensions from URLs
- **trailingSlash** - Add or remove trailing slashes
- **regions** - Deploy functions to specific regions
- **images** - Configure image optimization settings
- **redirects** - Redirect requests to different URLs
- **functions** - Configure function memory and timeout

### Security & Performance

- Service Worker caching optimized for offline support
- Static assets cached with 1-year expiration
- SPA routing configured for client-side navigation

### Environment Configuration

See `.env.example` for required variables:

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

### Ignored Files

`.vercelignore` prevents unnecessary files from being deployed:

- node_modules
- .git
- .env.local
- dist (rebuilt during deploy)
