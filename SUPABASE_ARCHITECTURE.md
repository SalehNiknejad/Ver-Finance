# معماری و پیکربندی Supabase برای پروژه‌های مالی

_یک راهنمای جامع برای درک و تکرار سیستم Supabase در پروژه‌های جدید_

---

## 📋 خلاصه پروژه

این پروژه یک **سیستم مدیریت مالی شخصی** است که Supabase را برای:

- ✅ احراز هویت کاربران (Email OTP)
- ✅ ذخیره تراکنش‌های مالی (درآمد، هزینه)
- ✅ مدیریت اقساط پرداختی
- ✅ ردیابی سرمایه‌گذاری‌های طلا
- ✅ تنظیمات شخصی کاربر
- ✅ امنیت داده‌های کاربری (Row Level Security)

**تکنولوژی**: React + TypeScript + Vite + Supabase

---

## 🗄️ ساختار پایگاه داده (Database Schema)

### 1. جدول `transactions` - تراکنش‌ها

```sql
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'side_income', 'expense')),
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 2 AND 120),
  amount NUMERIC(18, 2) NOT NULL CHECK (amount > 0),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**توضیح**:

- **id**: شناسه منحصر به فرد (UUID)
- **user_id**: کاربر مالک این تراکنش
- **type**: نوع تراکنش (درآمد، درآمد فرعی، هزینه)
- **title**: توضیح تراکنش (2-120 کاراکتر)
- **amount**: مبلغ (اعشار تا 2 رقم)
- **occurred_at**: زمان رخ دادن تراکنش
- **notes**: یادداشت‌های اضافی
- **timestamps**: تاریخ ایجاد و آخرین بروزرسانی

**ایندکس‌ها**:

```sql
CREATE INDEX transactions_user_occurred_idx ON public.transactions (user_id, occurred_at DESC);
CREATE INDEX transactions_user_type_idx ON public.transactions (user_id, type);
```

---

### 2. جدول `installment_plans` - طرح‌های اقساطی

```sql
CREATE TABLE public.installment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 2 AND 120),
  total_amount NUMERIC(18, 2) NOT NULL CHECK (total_amount > 0),
  installment_amount NUMERIC(18, 2) NOT NULL CHECK (installment_amount > 0),
  total_installments INTEGER NOT NULL CHECK (total_installments > 0),
  paid_installments INTEGER NOT NULL DEFAULT 0
    CHECK (paid_installments >= 0 AND paid_installments <= total_installments),
  start_date DATE NOT NULL,
  due_day INTEGER NOT NULL CHECK (due_day BETWEEN 1 AND 31),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**توضیح**:

- **total_amount**: مبلغ کل اقساط
- **installment_amount**: مبلغ هر قسط
- **total_installments**: تعداد کل اقساط
- **paid_installments**: تعداد اقساط پرداخت شده
- **start_date**: تاریخ شروع
- **due_day**: روز سررسید ماهانه (1-31)

**ایندکس**:

```sql
CREATE INDEX installment_plans_user_idx ON public.installment_plans (user_id, created_at DESC);
```

---

### 3. جدول `gold_transactions` - تراکنش‌های طلا

```sql
CREATE TABLE public.gold_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
  grams NUMERIC(12, 3) NOT NULL CHECK (grams > 0),
  price_per_gram NUMERIC(18, 2) NOT NULL CHECK (price_per_gram > 0),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**توضیح**:

- **type**: خرید یا فروش
- **grams**: وزن طلا (تا 3 رقم اعشار)
- **price_per_gram**: قیمت واحد
- محاسبه مبلغ کل = grams × price_per_gram

**ایندکس**:

```sql
CREATE INDEX gold_transactions_user_occurred_idx ON public.gold_transactions (user_id, occurred_at DESC);
```

---

### 4. جدول `user_settings` - تنظیمات کاربر

```sql
CREATE TABLE public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  gold_price_per_gram NUMERIC(18, 2) NOT NULL DEFAULT 7500000
    CHECK (gold_price_per_gram >= 0),
  theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'system')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**توضیح**:

- **gold_price_per_gram**: قیمت مرجع طلا برای محاسبات
- **theme**: تم تاریک/روشن/سیستمی

---

## 🔐 امنیت (Row Level Security - RLS)

تمام جداول فقط کاربر مالک داده‌ها را می‌بیند و ویرایش می‌کند:

```sql
-- برای تمام جداول:
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- یک سیاست که تمام عملیات (SELECT, INSERT, UPDATE, DELETE) را پوشش می‌دهد:
CREATE POLICY "Users manage own transactions"
  ON public.transactions
  FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
```

**نتیجه**: هر کاربر فقط می‌تواند داده‌های خود را ببیند و تغییر دهد.

---

## 🔄 Triggers و Automatic Updates

برای هر جدول، trigger‌ها `updated_at` را خودکار بروزرسانی می‌کنند:

```sql
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER transactions_set_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
```

---

## 📡 Realtime Subscriptions

جداول به‌برای Realtime فعال شده‌اند:

```sql
ALTER TABLE public.transactions REPLICA IDENTITY FULL;
ALTER TABLE public.transactions REPLICA IDENTITY FULL;
ALTER TABLE public.installment_plans REPLICA IDENTITY FULL;
ALTER TABLE public.gold_transactions REPLICA IDENTITY FULL;
ALTER TABLE public.user_settings REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.installment_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gold_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_settings;
```

---

## 🔑 احراز هویت (Authentication)

### تنظیمات Supabase Dashboard:

1. **Authentication → Providers**
   - ✅ Email provider فعال است
   - روش: OTP (کد یکبار مصرف)

2. **Authentication → URL Configuration**

   ```
   Redirect URLs:
   - Development: http://localhost:5173
   - Production: https://your-domain.vercel.app
   ```

3. **Authentication → Email Templates** (اختیاری)
   - می‌توانید متن ایمیل را سفارشی کنید

---

## 🔧 متغیرهای محیطی (Environment Variables)

ایجاد فایل `.env.local` (مسئول: مراحل تنظیم):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**کجا درست بگیریم**:

- برو به Supabase Dashboard
- Settings → API
- کپی کن: Project URL و Anon key

---

## 💻 اتصال در کد

### 1. ایجاد Supabase Client

**فایل**: `src/services/supabase.ts`

```typescript
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = createClient<Database>(
  url || "https://demo.invalid.supabase.co",
  anonKey || "demo-anon-key",
  {
    auth: {
      persistSession: true, // حفظ نشست در localStorage
      autoRefreshToken: true, // خودکار تازه‌سازی توکن
      detectSessionInUrl: true, // تشخیص نشست در URL
    },
    realtime: {
      params: { eventsPerSecond: 10 }, // محدودیت پیام‌های Realtime
    },
  },
);
```

### 2. نوع‌های TypeScript

**فایل**: `src/types/database.ts`

```typescript
import type {
  GoldTransaction,
  InstallmentPlan,
  Transaction,
  UserSettings,
} from "./domain";

type Table<Row extends Record<string, unknown>> = {
  Row: Row;
  Insert: Row;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      transactions: Table<Transaction>;
      installment_plans: Table<InstallmentPlan>;
      gold_transactions: Table<GoldTransaction>;
      user_settings: Table<UserSettings>;
    };
  };
};
```

### 3. خدمات (Services)

**فایل**: `src/services/finance-service.ts`

```typescript
import { supabase } from "./supabase";
import type {
  Transaction,
  InstallmentPlan,
  GoldTransaction,
  UserSettings,
} from "@/types/domain";

// دریافت تمام داده‌های مالی کاربر
export async function fetchFinanceSnapshot(userId: string) {
  const [transactions, plans, gold, settings] = await Promise.all([
    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("occurred_at", { ascending: false }),
    supabase
      .from("installment_plans")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("gold_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("occurred_at", { ascending: false }),
    supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);
  // پردازش نتایج...
}

// اضافه یا بروزرسانی تراکنش
export async function upsertTransaction(
  row: Transaction,
): Promise<Transaction> {
  const { data, error } = await supabase
    .from("transactions")
    .upsert(row)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// حذف تراکنش
export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// تابع‌های مشابه برای:
// - upsertInstallment / deleteInstallment
// - upsertGoldTransaction / deleteGoldTransaction
// - upsertSettings
```

---

## 🚀 مراحل تنظیم برای پروژه جدید

### مرحله 1️⃣: ایجاد Supabase Project

1. برو به [supabase.com](https://supabase.com)
2. ثبت نام و ورود
3. **New Project** کلیک کن
4. نام و رمز عبور تقویت شده تنظیم کن
5. منطقه (Region) انتخاب کن

### مرحله 2️⃣: تنظیم Database Schema

1. در Supabase Dashboard، برو به **SQL Editor**
2. کپی کن کل Script Schema (فوق را)
3. Paste کن و اجرا کن ✅

### مرحله 3️⃣: تنظیم RLS Policies

1. برو به **SQL Editor**
2. اجرا کن RLS Policies Script
3. تست: نه‌تنها کاربران دیگر نمی‌توانند داده‌های شما را ببینند

### مرحله 4️⃣: تنظیم Authentication

1. برو به **Authentication**
2. Email provider را تأیید کن ✅
3. **URL Configuration**:
   - Add: `http://localhost:5173` (Dev)
   - Add: `https://your-domain.com` (Prod)

### مرحله 5️⃣: تنظیم Environment Variables

1. ایجاد `.env.local` در پروژه React
2. کپی کن Project URL و Anon Key
3. مقادیر را پاست کن:
   ```env
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```

### مرحله 6️⃣: نصب npm Package

```bash
npm install @supabase/supabase-js
```

---

## 📊 مثال عملی: اضافه کردن تراکنش

### 1. کامپوننت Form

```typescript
// src/features/transactions/transaction-form.tsx
import { useState } from 'react'
import { upsertTransaction } from '@/services/finance-service'
import { useAuth } from '@/hooks/use-auth'

export function TransactionForm() {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      await upsertTransaction({
        id: crypto.randomUUID(),
        user_id: user.id,
        type,
        title,
        amount: parseFloat(amount),
        occurred_at: new Date().toISOString(),
        notes: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      // ریفریش داده‌ها...
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="توضیح"
        required
      />
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="مبلغ"
        required
      />
      <select value={type} onChange={(e) => setType(e.target.value as 'income' | 'expense')}>
        <option value="income">درآمد</option>
        <option value="expense">هزینه</option>
      </select>
      <button type="submit" disabled={loading}>
        {loading ? 'در حال ذخیره...' : 'اضافه کردن'}
      </button>
    </form>
  )
}
```

---

## 🔍 عیب‌یابی (Troubleshooting)

### مشکل: تراکنش‌ها ذخیره نمی‌شوند

✅ **حل**:

1. بررسی کن Environment Variables درست پر شده‌اند
2. اطمینان حاصل کن `isSupabaseConfigured === true`
3. بررسی کن RLS Policies درست تنظیم شده‌اند
4. کنسول مرورگر را برای خطا‌ها بررسی کن

### مشکل: "User not authenticated"

✅ **حل**:

1. صفحه login را تست کن
2. بررسی کن کاربر logged-in است
3. بررسی کن session در localStorage ذخیره شده است

### مشکل: "Realtime not updating"

✅ **حل**:

1. بررسی کن جداول برای Realtime enable شده‌اند
2. بررسی کن `REPLICA IDENTITY FULL` تنظیم شده
3. بررسی کن publication include جداول است

---

## 📚 منابع مفید

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## ✨ بهترین شیوه‌ها (Best Practices)

✅ **DO**:

- استفاده از TypeScript برای ایمنی نوع
- اجرای RLS برای تمام جداول
- استفاده از indexes برای بهتری عملکرد
- مقادیر environment را به `.gitignore` اضافه کن
- Error handling مناسب در همه جا

❌ **DON'T**:

- API key‌ها را در کد انجمن نگذاشت
- RLS را غیرفعال نگذاشت
- بدون validation داده‌ها را ذخیره نکن
- موارد حساس را در client-side store نگذاشت

---

**آپدیت شده**: تاریخ: 2026-09-09  
**نسخه**: 1.0  
**وضعیت**: تایید شده برای تکرار در پروژه‌های جدید ✅
