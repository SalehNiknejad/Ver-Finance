# ⚡ Quick Start - راهنمای سریع

برای شروع سریع، این مراحل را پیروی کن:

## 📋 خلاصه

این پروژه یک اپلیکیشن مدیریت مالی شاملVert Finance) است که:

- ✅ Login امن با OTP (بدون رمز عبور)
- ✅ مدیریت تراکنش‌ها و اقساط
- ✅ سرمایه‌گذاری طلا
- ✅ نمودارهای تحلیلی
- ✅ Offline support (هنگام قطع اینترنت)
- ✅ PWA (نصب به عنوان اپ)

## 🚀 شروع سریع (10 دقیقه)

### مرحله 1: Supabase

```bash
# 1. برو به https://supabase.com
# 2. ایجاد project جدید
# 3. کپی: Project URL و Anon Key
```

### مرحله 2: .env.local

```bash
# در root پروژه، فایل .env.local ایجاد کن:
VITE_SUPABASE_URL=<Project URL>
VITE_SUPABASE_ANON_KEY=<Anon Key>
```

### مرحله 3: Database

```bash
# در Supabase SQL Editor، اجرا کن:

# 1. اولین migration
-- [کپی محتوای supabase/migrations/202608100001_initial_schema.sql]

# 2. RLS Policies
-- [کپی محتوای supabase/RLS_POLICIES.sql]
```

### مرحله 4: تست محلی

```bash
npm install
npm run dev
```

برو به `http://localhost:5173` و login کن! 🎉

## 🌐 Deployment به Vercel

### مرحله 1: Push به GitHub

```bash
git add .
git commit -m "Ready for Vercel"
git push origin main
```

### مرحله 2: Vercel

1. برو به [vercel.com](https://vercel.com)
2. Import Repository
3. اضافه کن Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

## 📁 ساختار پروژه

```
├── src/
│   ├── pages/           # صفحات اصلی
│   ├── components/      # React components
│   ├── services/        # Supabase و Firebase services
│   ├── store/           # Zustand stores (state management)
│   ├── hooks/           # Custom React hooks
│   └── types/           # TypeScript types
├── supabase/
│   ├── migrations/      # Database migrations
│   └── RLS_POLICIES.sql # Row Level Security
├── public/              # Static assets (logo, favicon)
├── SUPABASE_SETUP.md    # راهنمای تفصیلی Supabase
├── DEPLOYMENT.md        # Vercel deployment
├── USAGE_GUIDE.md       # نحوه استفاده
└── vercel.json          # Vercel config
```

## 🔐 Security

- ✅ OTP email authentication (بدون رمز عبور)
- ✅ Row Level Security (RLS) - هر کاربر فقط اطلاعات خود
- ✅ HTTPS فقط در Vercel
- ✅ Environment variables امن در Vercel

## 📱 Features

### Dashboard

- متریک‌های مالی (موجودی، درآمد، هزینه)
- نمودارهای رفت‌و‌آمد پول
- نمودار دارایی خالص

### Transactions

- ثبت درآمد و هزینه
- فیلتر و جستجو
- تاریخچه تراکنش‌ها

### Installments

- ایجاد طرح‌های اقساطی
- پیگیری سررسید‌ها
- محاسبه خودکار مانده

### Gold Investment

- ثبت خرید و فروش طلا
- محاسبه ارزش جاری
- تحلیل بازدهی

## 📞 منابع

- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - تنظیم کامل
- [USAGE_GUIDE.md](./USAGE_GUIDE.md) - نحوه استفاده
- [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md) - چک‌لیست
- [Supabase Docs](https://supabase.com/docs)

## ❓ سوالات متداول

### Q: آیا بدون Supabase کار می‌کند؟

✅ بله! از demo data استفاده می‌کند. اما داده‌ها ذخیره نمی‌شود.

### Q: چطور Offline کار می‌کند؟

✅ IndexedDB محلی داده‌ها ذخیره می‌کند. هنگام اتصال، sync می‌شود.

### Q: آیا می‌توانم PWA نصب کنم؟

✅ بله! در موبایل، منو → "نصب اپ"

### Q: چطور رمز عبور را تغییر دهم؟

✅ OTP استفاده می‌شود. کلیک روی لینک در ایمیل برای login

### Q: داده‌های من ایمن است؟

✅ بله! RLS از Supabase، هر کاربر فقط اطلاعات خود

## 🎯 اگر مشکل داشتی:

1. **صفحه blank** → بررسی console logs (F12)
2. **Login نمی‌شود** → environment variables درست؟
3. **RLS خطا** → migrations اجرا شد؟
4. **Offline نمی‌کند** → browser storage فعال است؟

برای مشکلات بیشتر: [USAGE_GUIDE.md](./USAGE_GUIDE.md#7️⃣-مشکل‌گیری-troubleshooting)

---

## ✅ نکات نهایی

1. **API Keys محفوظ بمان** - هرگز public repos
2. **RLS الزامی است** - برای امنیت کاربران
3. **Test locally اول** - پس از آن Vercel
4. **Backup کن** - Supabase backups فعال کن

**حالا شروع کن! 🚀**
