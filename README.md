# VerTwo Finance — ورتو فایننس

یک PWA فارسی و RTL برای مدیریت درآمد، هزینه، اقساط و سرمایه‌گذاری طلا. برنامه با React 19، TypeScript سخت‌گیرانه، Tailwind CSS v4، Zustand و Supabase ساخته شده و در نبود شبکه از IndexedDB استفاده می‌کند.

## 🚀 شروع سریع

**👉 برای شروع فوری: [QUICKSTART.md](./QUICKSTART.md)**

## قابلیت‌ها

- ✅ ورود بدون رمز با Email OTP و مسیرهای محافظت‌شده
- ✅ ثبت، ویرایش، حذف و فیلتر زمانی درآمد و هزینه
- ✅ برنامه اقساط، مانده مبلغ/تعداد و نزدیک‌ترین سررسید
- ✅ خرید و فروش طلا، میانگین خرید، ارزش روز و سود/زیان
- ✅ داشبورد جریان نقدی و روند دارایی با Recharts
- ✅ همگام‌سازی Supabase Realtime، به‌روزرسانی خوش‌بینانه و صف آفلاین
- ✅ PWA نصب‌شونده، پوسته روشن/تیره، رابط واکنش‌گرا و ارقام فارسی

## 📚 راهنماها

| راهنما                                     | توضیح                   |
| ------------------------------------------ | ----------------------- |
| [QUICKSTART.md](./QUICKSTART.md)           | ⚡ شروع فوری (10 دقیقه) |
| [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)   | 🔧 تنظیم کامل Supabase  |
| [DEPLOYMENT.md](./DEPLOYMENT.md)           | 🚀 Deployment به Vercel |
| [USAGE_GUIDE.md](./USAGE_GUIDE.md)         | 📖 نحوه استفاده و تست   |
| [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md) | ✅ چک‌لیست تنظیم        |

## اجرای محلی

پیش‌نیاز: Node.js 20.19 یا جدیدتر.

```bash
# 1. نصب dependencies
npm install

# 2. ایجاد فایل محیطی
cp .env.example .env.local

# 3. تکمیل متغیرهای محیطی
# VITE_SUPABASE_URL=your-supabase-url
# VITE_SUPABASE_ANON_KEY=your-anon-key

# 4. اجرای dev server
npm run dev
```

در Windows PowerShell برای ساخت فایل محیطی از این دستور استفاده کنید:

```powershell
Copy-Item .env.example .env.local
```

سپس `.env.local` را در VS Code باز کن و متغیرها را تکمیل کن.

## 🔐 متغیرهای محیطی

### توسعه محلی (.env.local)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Vercel (Dashboard → Settings → Environment Variables)

اضافه کن دو متغیر برای `Production`, `Preview`, `Development`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 📁 ساختار پروژه

```
src/
├── app/                 # Layout و routing
├── components/          # React components
│   └── ui/             # UI components (Button, Card, etc.)
├── features/           # Feature-specific components
│   ├── dashboard/      # Dashboard features
│   ├── transactions/   # Transaction management
│   ├── installments/   # Installment management
│   └── gold/          # Gold investment features
├── hooks/              # Custom React hooks
├── lib/                # Utilities و constants
├── pages/              # Page components
├── services/           # External services
│   ├── supabase.ts     # Supabase client
│   ├── finance-service.ts  # Finance business logic
│   └── offline-db.ts   # IndexedDB management
├── store/              # Zustand stores
│   ├── auth-store.ts   # Authentication
│   └── finance-store.ts # Finance data
└── types/              # TypeScript types

supabase/
├── migrations/         # Database migrations
└── RLS_POLICIES.sql   # Row Level Security policies

public/
├── logo.svg            # لوگو اپلیکیشن
├── favicon.svg         # Favicon
└── pwa-*.png          # PWA icons
```

## 🛠️ فناوری‌ها

- **Frontend:** React 19, TypeScript, Tailwind CSS v4
- **State Management:** Zustand
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (Email OTP)
- **Offline Storage:** IndexedDB
- **Charts:** Recharts
- **Build:** Vite, Vitest
- **Deployment:** Vercel
- **PWA:** vite-plugin-pwa

## 📦 دستورات

```bash
# توسعه
npm run dev          # اجرای dev server
npm run build        # ساخت برای production
npm run preview      # پیش‌نمایش build

# کیفیت
npm run lint         # بررسی lint
npm run typecheck    # بررسی TypeScript
```

## 🔐 امنیت

- ✅ **Email OTP:** ورود بدون رمز عبور
- ✅ **Row Level Security:** هر کاربر فقط اطلاعات خود
- ✅ **HTTPS Only:** در Vercel فقط HTTPS
- ✅ **Environment Secrets:** حساس‌ترین اطلاعات در Vercel
- ✅ **Session Management:** Supabase auth persistence

**⚠️ هرگز اطلاعات حساس را commit نکن!**

## 📱 PWA Support

اپ را می‌توان به‌عنوان PWA نصب کرد:

- Android: منو → "نصب اپ"
- iOS: Share → "صفحه شروع"
- Desktop: آدرس‌بار → نصب آیکن

## 🌙 اسلامی/پارسی

- ✅ RTL (راست‌به‌چپ) support
- ✅ تاریخ شمسی
- ✅ اعداد فارسی
- ✅ فونت فارسی

## 🚀 Deployment

### Vercel

1. Push به GitHub
2. Vercel Dashboard → Import Repository
3. اضافه کن Environment Variables
4. Deploy!

برای جزئیات: [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📖 مسیر یادگیری

1. **شروع:** [QUICKSTART.md](./QUICKSTART.md)
2. **Supabase:** [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
3. **Deployment:** [DEPLOYMENT.md](./DEPLOYMENT.md)
4. **استفاده:** [USAGE_GUIDE.md](./USAGE_GUIDE.md)
5. **Checklist:** [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)

## 📞 مشکل‌گیری

**صفحه blank:**

```bash
# بررسی console
F12 → Console → خطاها را ببین
```

**Login نمی‌شود:**

- Environment variables درست است؟
- Supabase project active است؟
- Email authentication فعال است؟

**Offline نمی‌کند:**

- IndexedDB فعال است؟
- Storage quota زیادی مصرف شده؟

برای مشکلات بیشتر: [USAGE_GUIDE.md#7️⃣-مشکل‌گیری](./USAGE_GUIDE.md)

## 📄 لایسنس

MIT

## 🤝 حمایت

برای سوال‌ها و مشکلات:

1. [Issues](./USAGE_GUIDE.md) بررسی کن
2. Documentation مطالعه کن
3. [Supabase Docs](https://supabase.com/docs) مراجعه کن

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
