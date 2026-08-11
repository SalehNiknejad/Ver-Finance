# VerTwo Finance — ورتو فایننس

یک PWA فارسی و RTL برای مدیریت درآمد، هزینه، اقساط و سرمایه‌گذاری طلا. برنامه با React 19، TypeScript سخت‌گیرانه، Tailwind CSS v4، Zustand و Supabase ساخته شده و در نبود شبکه از IndexedDB استفاده می‌کند.

## قابلیت‌ها

- ورود بدون رمز با Email OTP و مسیرهای محافظت‌شده
- ثبت، ویرایش، حذف و فیلتر زمانی درآمد و هزینه
- برنامه اقساط، مانده مبلغ/تعداد و نزدیک‌ترین سررسید
- خرید و فروش طلا، میانگین خرید، ارزش روز و سود/زیان
- داشبورد جریان نقدی و روند دارایی با Recharts
- همگام‌سازی Supabase Realtime، به‌روزرسانی خوش‌بینانه و صف آفلاین
- PWA نصب‌شونده، پوسته روشن/تیره، رابط واکنش‌گرا و ارقام فارسی

## اجرای محلی

پیش‌نیاز: Node.js 20.19 یا جدیدتر.

```bash
npm install
cp .env.example .env.local
npm run dev
```

در Windows PowerShell برای ساخت فایل محیطی از این دستور استفاده کنید:

```powershell
Copy-Item .env.example .env.local
```

اگر متغیرهای Supabase تنظیم نشده باشند، برنامه خودکار در حالت نمایشی اجرا می‌شود. این حالت داده‌های اولیه را در IndexedDB همان مرورگر نگه می‌دارد.

## پیکربندی Supabase

1. در Supabase یک پروژه بسازید.
2. در SQL Editor، فایل‌های پوشه `supabase/migrations` را به ترتیب اجرا کنید؛ یا با Supabase CLI دستور `supabase db push` را اجرا کنید.
3. در **Authentication → Providers → Email**، ارائه‌دهنده Email و ورود OTP/Magic Link را فعال کنید.
4. در **Authentication → URL Configuration**، مقدار Site URL را برای توسعه `http://localhost:5173` و پس از انتشار دامنه نهایی قرار دهید. هر دو نشانی را به Redirect URLs نیز اضافه کنید.
5. از **Project Settings → API**، Project URL و کلید anon را در `.env.local` قرار دهید:

```env
VITE_SUPABASE_URL=https://PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

مهاجرت نخست جدول‌ها، محدودیت‌ها، ایندکس‌ها، RLS و Realtime را فعال می‌کند. مهاجرت دوم برای هر کاربر جدید داده‌های آغازین PRD را می‌سازد: درآمد ثابت ۴۲ میلیون، هزینه ماهانه ۸ میلیون و پنج قسط ۳۰ میلیونی خودرو. RLS دسترسی هر کاربر را به ردیف‌های خودش محدود می‌کند.

## بررسی کیفیت و ساخت

```bash
npm run lint
npm run typecheck
npm run build
npm run preview
```

خروجی production در `dist/` ساخته می‌شود. Service Worker در حالت production ثبت می‌شود و پوسته برنامه و فونت را cache می‌کند؛ تغییرات داده‌ای آفلاین در IndexedDB صف می‌شوند و با رویداد `online` به Supabase ارسال خواهند شد.

## انتشار در Vercel

1. مخزن را به GitHub/GitLab/Bitbucket متصل و در Vercel Import کنید.
2. Framework Preset را **Vite**، Build Command را `npm run build` و Output Directory را `dist` بگذارید.
3. دو متغیر `VITE_SUPABASE_URL` و `VITE_SUPABASE_ANON_KEY` را در Project Settings → Environment Variables برای Production و Preview اضافه کنید.
4. پروژه را Deploy کنید.
5. دامنه Vercel را در Site URL و Redirect URLs پروژه Supabase ثبت کنید.

فایل `vercel.json` تمام مسیرهای SPA را به `index.html` بازنویسی می‌کند، بدون اینکه درخواست فایل‌های موجود را مختل کند.

## ساختار پروژه

```text
src/
  app/             router، layout و theme
  components/      اجزای عمومی و UI مبتنی بر الگوی shadcn/ui
  features/        dashboard، transactions، installments و gold
  hooks/           sync و محاسبات مشتق‌شده
  lib/             ابزارها و داده نمایشی
  pages/           صفحه‌های route-level
  services/        Supabase، API و IndexedDB
  store/           Zustand stores
  types/           مدل دامنه و Database types
supabase/migrations/
```

## نکات امنیتی

کلید anon برای کلاینت عمومی طراحی شده است و امنیت داده توسط RLS برقرار می‌شود. هرگز service-role key را در متغیرهای `VITE_*` قرار ندهید. برای محیط واقعی، تنظیمات نرخ ارسال ایمیل، SMTP سفارشی و CAPTCHA در Supabase توصیه می‌شود.
