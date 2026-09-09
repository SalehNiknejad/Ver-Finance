# چک لیست تنظیم Supabase + Vercel

این checklist تمام مراحل لازم برای فعال کردن سیستم login و مدیریت اطلاعات کاربری را پوشش می‌دهد.

## ✅ مرحله 1: Supabase Project

- [ ] ثبت نام در [supabase.com](https://supabase.com)
- [ ] یک project جدید ایجاد کردم
- [ ] Database password را ذخیره کردم (امن!)
- [ ] Region را انتخاب کردم

## ✅ مرحله 2: API Keys

- [ ] Project URL کپی کردم: `https://xxxxx.supabase.co`
- [ ] Anon Key کپی کردم
- [ ] `.env.local` فایل ایجاد کردم (برای تست محلی)
- [ ] دو variable را در `.env.local` اضافه کردم:
  ```
  VITE_SUPABASE_URL=...
  VITE_SUPABASE_ANON_KEY=...
  ```

## ✅ مرحله 3: Database Schema

- [ ] برو به **Supabase → SQL Editor**
- [ ] اجرا کردم: `supabase/migrations/202608100001_initial_schema.sql`
- [ ] اجرا کردم: `supabase/migrations/202608100002_seed_new_users.sql`
- [ ] بررسی کردم جداول ایجاد شد:
  ```sql
  SELECT * FROM pg_tables WHERE schemaname = 'public';
  ```
- [ ] جداول موجود:
  - [ ] `transactions`
  - [ ] `installment_plans`
  - [ ] `gold_investments` (اگر کاربرد دارد)

## ✅ مرحله 4: Authentication Setup

- [ ] برو به **Supabase → Authentication → Providers**
- [ ] Email provider فعال است
- [ ] برو به **URL Configuration**
- [ ] اضافه کردم Redirect URLs:
  ```
  http://localhost:5173
  https://your-domain.vercel.app
  ```

## ✅ مرحله 5: Row Level Security (RLS)

- [ ] برو به **SQL Editor**
- [ ] اجرا کردم: `supabase/RLS_POLICIES.sql`
- [ ] تمام policies ایجاد شد
- [ ] بررسی کردم:
  ```sql
  SELECT * FROM pg_policies WHERE tablename = 'transactions';
  ```

## ✅ مرحله 6: Vercel Environment Variables

### 6.1 اضافه کردن Variables

- [ ] برو به **Vercel Dashboard → Project Settings**
- [ ] انتخاب کردم **Environment Variables**
- [ ] اضافه کردم `VITE_SUPABASE_URL`:
  - [ ] Production
  - [ ] Preview
  - [ ] Development
- [ ] اضافه کردم `VITE_SUPABASE_ANON_KEY`:
  - [ ] Production
  - [ ] Preview
  - [ ] Development

### 6.2 Redeploy

- [ ] برو به **Deployments**
- [ ] Redeploy کردم تا environment variables لود شود

## ✅ مرحله 7: تست محلی

```bash
# 1. نصب dependencies
npm install

# 2. اجرا کردن development server
npm run dev
```

- [ ] پروژه بر روی `http://localhost:5173` اجرا می‌شود
- [ ] صفحه login نمایش داده می‌شود
- [ ] آیکون و لوگو صحیح نمایش داده می‌شوند

### 7.1 تست Login Flow

- [ ] کلیک کردم بر روی صفحه login
- [ ] ایمیل خود را وارد کردم
- [ ] بر روی "ارسال لینک ورود" کلیک کردم
- [ ] پیام "ایمیل را بررسی کنید" ظاهر شد
- [ ] ایمیل OTP دریافت کردم
- [ ] روی لینک در ایمیل کلیک کردم
- [ ] به صفحه dashboard redirected شدم
- [ ] Dashboard اطلاعات کاربری نمایش می‌دهد

## ✅ مرحله 8: تست Vercel Deployment

- [ ] پروژه موفقیت‌آمیز deployed شد
- [ ] بر روی Vercel domain رفتم
- [ ] صفحه login نمایش داده می‌شود
- [ ] OTP login کار می‌کند

## ✅ مرحله 9: تست تخصیص‌های داده

### 9.1 Dashboard Features

- [ ] میتوانم تراکنش اضافه کنم
- [ ] میتوانم اقساط ایجاد کنم
- [ ] میتوانم سرمایه‌گذاری طلا ثبت کنم
- [ ] نمودارهای dashboard نمایش داده می‌شود

### 9.2 Security Check

- [ ] میتوانم فقط اطلاعات خود را ببینم
- [ ] اگر logout کنم، صفحه login نمایش داده می‌شود
- [ ] اگر سعی کنم مستقیم به dashboard برم، به login redirected می‌شوم

## ✅ مرحله 10: تنظیمات اختیاری

- [ ] Email templates را شخصی‌سازی کردم (اختیاری)
- [ ] Rate limits تنظیم کردم (اختیاری)
- [ ] Supabase logging فعال کردم (اختیاری)

## 🎉 کامل!

تمام مراحل تکمیل شد. اطلاعات کاربری محفوظ و قابل دسترسی هستند.

### نکات مهم:

⚠️ **Anon Key امن نیست برای secrets - هرگز password خود را در client side قرار ندی**
⚠️ **Service Role Key را فقط در backend استفاده کن**
⚠️ **RLS policies الزامی است برای امنیت**

### منابع:

- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - تفصیلی‌تر
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Vercel deployment
- [Supabase Docs](https://supabase.com/docs)
