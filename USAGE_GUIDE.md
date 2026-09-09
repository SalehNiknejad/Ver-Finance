# راهنمای استفاده و تست سیستم

راهنمای کامل برای تست کردن سیستم login و مدیریت اطلاعات کاربری.

## 1️⃣ تست محلی (Local Testing)

### 1.1 نصب و اجرا

```bash
# 1. نصب dependencies
npm install

# 2. ایجاد .env.local
# محتوای فایل:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key

# 3. اجرای development server
npm run dev
```

### 1.2 صفحه اول - Login

```
URL: http://localhost:5173
```

**صفحه Login باید:**

- ✅ لوگو ورتو فایننس را نمایش دهد
- ✅ فیلد ایمیل داشته باشد
- ✅ دکمه "ارسال لینک ورود" داشته باشد

**مراحل:**

1. ایمیل خود را وارد کن: `your-email@example.com`
2. روی "ارسال لینک ورود" کلیک کن
3. پیام "ایمیل‌تان را بررسی کنید" ظاهر می‌شود

### 1.3 دریافت OTP Email

**چگونه کار می‌کند:**

- Supabase یک لینک login محفوظ برای ایمیل می‌فرستد
- روی لینک کلیک کن → خودکار وارد می‌شوی
- Session token در browser ذخیره می‌شود

**اگر ایمیل دریافت نشد:**

1. Spam folder بررسی کن
2. Supabase Auth Logs بررسی کن:
   - برو: **Supabase → Authentication → Auth Logs**
   - خطا را ببین
3. Email address صحیح است؟

### 1.4 Dashboard - پس از Login

**صفحه Dashboard باید نمایش دهد:**

- ✅ متریک‌های مالی (موجودی، درآمد، هزینه، etc.)
- ✅ نمودارهای cash flow
- ✅ فهرست اقساط فعال
- ✅ یک منوی navigation

## 2️⃣ اضافه کردن اطلاعات کاربری

### 2.1 تراکنش‌ها (Transactions)

**برو به: Dashboard → Transactions**

```
نوع:
- درآمد (Income)
- درآمد جانبی (Side Income)
- هزینه (Expense)

مثال:
- حقوق: 50,000,000 تومان
- خرید: 2,500,000 تومان
- بونوس: 10,000,000 تومان
```

**مراحل:**

1. روی دکمه "تراکنش جدید" کلیک کن
2. نوع را انتخاب کن
3. مبلغ و توضیح را وارد کن
4. روی "افزودن" کلیک کن
5. تراکنش در جدول ظاهر می‌شود

### 2.2 اقساط (Installments)

**برو به: Dashboard → Installments**

```
مثال:
- نام: خرید لپ‌تاپ
- مبلغ کل: 50,000,000 تومان
- هر قسط: 5,000,000 تومان
- تعداد قسط: 10
- سررسید: روز 15 ماه
```

**مراحل:**

1. روی دکمه "قسط جدید" کلیک کن
2. اطلاعات را وارد کن
3. روی "ایجاد" کلیک کن
4. در dashboard "نزدیک‌ترین سررسید" نمایش داده می‌شود

### 2.3 سرمایه‌گذاری طلا (Gold)

**برو به: Dashboard → Gold**

```
مثال:
- خریداری: 10 گرم طلا
- قیمت به ازای هر گرم: 8,500,000 تومان
```

**مراحل:**

1. روی دکمه "تراکنش طلا" کلیک کن
2. مقدار (گرم) را وارد کن
3. روی "افزودن" کلیک کن

## 3️⃣ مشاهده و مدیریت داده‌ها

### 3.1 Dashboard Metrics

**نمایش دهنده:**

- 💰 موجودی نقدی = درآمد - هزینه
- 🏆 ارزش طلا = گرم × قیمت جاری
- 📈 درآمد این ماه
- 📉 هزینه این ماه
- 💳 مانده اقساط
- 💎 دارایی خالص = نقد + طلا - اقساط

### 3.2 نمودارهای تحلیلی

**Cash Flow Chart:**

- نمودار رفت‌و‌آمد پول (درآمد vs هزینه)
- به تفکیک ماه

**Net Worth Chart:**

- دارایی خالص در طول زمان
- نمایش روند افزایش/کاهش

## 4️⃣ تست امنیت و RLS

### 4.1 بررسی اطلاعات شخصی

**تست RLS:**

```bash
# 1. دو تب مرورگر باز کن
# تب 1: ایمیل user1@example.com
# تب 2: ایمیل user2@example.com

# 2. هر کاربر فقط اطلاعات خود را ببیند
# RLS باید مانع دسترسی به داده‌های دیگری شود
```

### 4.2 بررسی Logout

```bash
# 1. روی آیکون profile کلیک کن
# 2. بر روی "خروج" کلیک کن
# 3. به صفحه login منتقل می‌شوی
# 4. دوباره login کن
```

### 4.3 بررسی Protected Routes

```bash
# 1. پس از logout، سعی کن مستقیم به dashboard برو
# URL: http://localhost:5173/dashboard
# ✅ باید به login page منتقل شوی
```

## 5️⃣ تست Vercel Deployment

### 5.1 اطمینان حاصل کن:

```bash
# 1. بسازی
npm run build

# 2. تست
npm run preview
```

### 5.2 Deploy به Vercel:

```bash
# اگر Vercel CLI نصب است:
vercel

# یا از Vercel Dashboard
# -> Import Repository -> Deploy
```

### 5.3 تست Production:

1. برو به Vercel domain
2. صفحه login ظاهر می‌شود
3. login flow کار می‌کند
4. Dashboard نمایش داده می‌شود

## 6️⃣ بررسی Supabase Dashboard

### 6.1 مشاهده تراکنش‌ها

**Supabase → SQL Editor:**

```sql
SELECT * FROM transactions WHERE user_id = 'your-user-id';
```

### 6.2 مشاهده اقساط

```sql
SELECT * FROM installment_plans WHERE user_id = 'your-user-id';
```

### 6.3 مشاهده تمام کاربران

```sql
SELECT id, email, created_at FROM auth.users;
```

## 7️⃣ مشکل‌گیری (Troubleshooting)

### ❌ مشکل: "Supabase is not configured"

**صفحه dashboard فقط demo data را نمایش می‌دهد:**

```bash
# بررسی .env.local
# دو متغیر باید موجود باشند:
# VITE_SUPABASE_URL
# VITE_SUPABASE_ANON_KEY

# اگر موجود نیست، به SUPABASE_SETUP.md مراجعه کن
```

### ❌ مشکل: OTP Email دریافت نمی‌شود

```bash
# 1. Spam folder بررسی کن
# 2. Supabase Auth Logs بررسی کن:
#    Supabase → Authentication → Auth Logs
# 3. Redirect URL صحیح است؟
#    Supabase → Authentication → URL Configuration
```

### ❌ مشکل: "relation transactions does not exist"

```bash
# Migrations اجرا شد؟
# در Supabase SQL Editor اجرا کن:

SELECT * FROM pg_tables WHERE schemaname = 'public';

-- اگر جداول نیستند، migrations اجرا کن:
-- supabase/migrations/202608100001_initial_schema.sql
```

### ❌ مشکل: RLS سیاست‌ها کار نمی‌کنند

```bash
# Supabase → SQL Editor:

-- بررسی کن RLS فعال است
SELECT relname FROM pg_class WHERE relrowsecurity = true;

-- بررسی کن policies موجود است
SELECT * FROM pg_policies WHERE tablename = 'transactions';
```

## 8️⃣ Offline Support

پروژه از **offline-first** pattern استفاده می‌کند:

- ✅ داده‌ها محلی ذخیره می‌شود (IndexedDB)
- ✅ حتی بدون اینترنت کار می‌کند
- ✅ هنگام برگشت اینترنت، همگام می‌شود

**تست:**

1. Dashboard را باز کن
2. Internet خاموش کن (DevTools)
3. داده‌های جدید اضافه کن
4. Internet روشن کن
5. داده‌ها از Supabase sync می‌شود

## ✅ چک‌لیست نهایی

- [ ] Login درست کار می‌کند
- [ ] Dashboard نمایش داده می‌شود
- [ ] تراکنش‌ها اضافه می‌شود
- [ ] اقساط اضافه می‌شود
- [ ] نمودارها درست نمایش داده می‌شود
- [ ] RLS کار می‌کند (یک کاربر فقط اطلاعات خود)
- [ ] Logout و دوباره login کار می‌کند
- [ ] Protected routes کار می‌کنند
- [ ] Vercel deployment کار می‌کند

## 📞 نیاز به کمک؟

- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - تنظیم Supabase
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment به Vercel
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
