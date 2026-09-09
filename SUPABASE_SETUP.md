# راهنمای تنظیم Supabase و Vercel

این راهنما شامل تمام مراحل لازم برای اتصال Supabase به Vercel و فعال کردن سیستم login و مدیریت داده‌های کاربری است.

## مرحله 1: ایجاد Supabase Project

### 1.1 ثبت نام و ورود

1. برو به [supabase.com](https://supabase.com)
2. ثبت نام یا وارد شو
3. روی "New Project" کلیک کن

### 1.2 ایجاد Project جدید

```
Project Name: vertwo-finance
Database Password: [رمز قوی بسیار بسیار]
Region: Select your closest region
```

### 1.3 کپی کردن Credentials

پس از ایجاد project:

1. برو به **Settings** → **API**
2. کپی کن:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Anon key** → `VITE_SUPABASE_ANON_KEY`

## مرحله 2: تنظیم Database Schema

### 2.1 اجرای Migrations

1. در Supabase dashboard، برو به **SQL Editor**
2. روی **New Query** کلیک کن
3. کپی کن محتوای این فایل و اجرا کن:
   - `supabase/migrations/202608100001_initial_schema.sql`
4. سپس فایل دوم را اجرا کن:
   - `supabase/migrations/202608100002_seed_new_users.sql`

### 2.2 جداول ایجاد شده:

- `transactions` - تراکنش‌ها (درآمد، هزینه)
- `installment_plans` - طرح‌های اقساطی
- `gold_investments` - سرمایه‌گذاری طلا

## مرحله 3: تنظیم Authentication

### 3.1 Email Authentication

1. در Supabase، برو به **Authentication** → **Providers**
2. اطمینان حاصل کن Email provider **فعال** است
3. برو به **Email Templates** (اختیاری):
   - می‌توانی متن ایمیل OTP را سفارشی کنی

### 3.2 تنظیم Redirect URLs

1. برو به **Authentication** → **URL Configuration**
2. اضافه کن **Redirect URLs**:
   - Development: `http://localhost:5173`
   - Production: `https://your-vercel-domain.vercel.app`

### 3.3 تنظیم Email Templates (Optional)

- Supabase بطور خودکار OTP ایمیل‌ها می‌فرستد
- می‌توانی template‌ها را شخصی‌سازی کنی

## مرحله 4: تنظیم Row Level Security (RLS)

### 4.1 فعال کردن RLS

برای هر جدول (`transactions`, `installment_plans`, `gold_investments`):

```sql
-- 1. فعال کردن RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 2. سیاست انتخاب (Select)
CREATE POLICY "Users can view own transactions"
  ON public.transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- 3. سیاست درج (Insert)
CREATE POLICY "Users can insert own transactions"
  ON public.transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. سیاست به‌روزرسانی (Update)
CREATE POLICY "Users can update own transactions"
  ON public.transactions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. سیاست حذف (Delete)
CREATE POLICY "Users can delete own transactions"
  ON public.transactions
  FOR DELETE
  USING (auth.uid() = user_id);
```

برای جداول دیگر، همین الگو را دنبال کن.

## مرحله 5: تنظیم Vercel Environment Variables

### 5.1 اضافه کردن Environment Variables

1. برو به Vercel Dashboard
2. انتخاب کن Project → **Settings** → **Environment Variables**
3. اضافه کن دو variable:

```
Name: VITE_SUPABASE_URL
Value: [URL کپی شده از Supabase]
Environments: Production, Preview, Development
```

```
Name: VITE_SUPABASE_ANON_KEY
Value: [Anon Key کپی شده از Supabase]
Environments: Production, Preview, Development
```

### 5.2 بازنشر (Redeploy) Project

1. برو به **Deployments**
2. روی **Redeploy** کلیک کن تا environment variables به کار بیفتند

## مرحله 6: تست محلی

### 6.1 ایجاد .env.local

```bash
# در root پروژه ایجاد فایل .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 6.2 اجرای پروژه

```bash
npm install
npm run dev
```

### 6.3 تست Login

1. باز کن `http://localhost:5173`
2. روی صفحه login بر
3. ایمیل خود را وارد کن
4. ایمیل OTP را بررسی کن
5. روی لینک کلیک کن

## مرحله 7: سیاست Supabase (اختیاری)

### 7.1 تنظیم Rate Limits

برای جلوگیری از سوء استفاده:

- **Authentication** → **Policies**
- Set rate limits برای OTP emails

### 7.2 تنظیم CORS

اگر از API‌های خارجی استفاده می‌کنی:

- **Settings** → **API** → **CORS**

## مرحله 8: مراقبت از امنیت

### 8.1 Anon Key vs Service Role Key

- `VITE_SUPABASE_ANON_KEY` - برای frontend (محدود)
- Service Role Key - فقط برای backend (محدود نیست)

### 8.2 بهترین روش‌ها

✅ هرگز Service Role Key را در frontend قرار ندی
✅ RLS سیاست‌ها را الزام کن
✅ API endpoints محدود کن
✅ صحت‌سنجی داده‌ها (Validation)

## Troubleshooting

### مشکل: "Supabase is not configured"

**حل**: Environment variables تنظیم شده‌اند؟

```bash
# بررسی کن که دو variable در Vercel موجود است
# VITE_SUPABASE_URL
# VITE_SUPABASE_ANON_KEY
```

### مشکل: OTP email دریافت نمی‌شود

1. بررسی کن Spam folder
2. بررسی کن Supabase **Auth Logs** برای خطاها
3. Redirect URL صحیح تنظیم شده؟

### مشکل: "relation transactions does not exist"

1. Migrations اجرا شده‌اند؟
2. در SQL Editor، اجرا کن:

```sql
SELECT * FROM pg_tables WHERE schemaname = 'public';
```

### مشکل: RLS سیاست‌ها کار نمی‌کنند

1. بررسی کن که RLS **فعال** است
2. Policies درست تنظیم شده‌اند؟
3. User authenticated است؟

## فایل‌های مهم

- `src/services/supabase.ts` - Supabase client configuration
- `src/store/auth-store.ts` - Authentication state management
- `src/pages/login-page.tsx` - Login page
- `supabase/migrations/` - Database migrations

## منابع مفید

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Vercel Docs](https://vercel.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
