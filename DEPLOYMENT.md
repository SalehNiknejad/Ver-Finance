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

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Framework**: Vite
- **Runtime**: Node.js 18+

## Features Configured

✅ PWA Support (Service Worker)
✅ Optimized Caching Headers
✅ RTL Support (Persian/Farsi)
✅ Mobile-first Design
✅ Logo & Favicon Assets
✅ SPA Routing (Single Page Application)

## Post-Deployment

- Visit your Vercel deployment URL
- Install as PWA on mobile devices
- Enable notifications if needed
