# ✅ Checklist سریع: راه‌اندازی Supabase در پروژه جدید

_کپی-پیست این مراحل برای راه‌اندازی سریع_

---

## 🚀 مرحله 1: ایجاد Supabase Project (5 دقیقه)

### 1.1 Account Setup

- [ ] ثبت نام در [supabase.com](https://supabase.com)
- [ ] تأیید ایمیل
- [ ] ورود به Dashboard

### 1.2 Project Creation

- [ ] کلیک "New Project"
- [ ] نام پروژه: `my-finance-app`
- [ ] رمز عبور قوی: `generate random password`
- [ ] Region: `Select your region`
- [ ] اتمام ✅

### 1.3 Credentials Copy

- [ ] برو به Settings → API
- [ ] کپی `Project URL`
- [ ] کپی `Anon Key` (عمومی - برای کلینت)
- [ ] ذخیره‌اش جایی محفوظ

---

## 🗄️ مرحله 2: تنظیم Database (10 دقیقه)

### 2.1 Schema Migration

1. Supabase Dashboard → SQL Editor
2. کلیک "New Query"
3. کپی این SQL script:

```sql
-- ============================================
-- VerTwo Finance - Complete Schema
-- ============================================

BEGIN;

-- 1. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
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

-- 2. INSTALLMENT_PLANS TABLE
CREATE TABLE IF NOT EXISTS public.installment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 2 AND 120),
  total_amount NUMERIC(18, 2) NOT NULL CHECK (total_amount > 0),
  installment_amount NUMERIC(18, 2) NOT NULL CHECK (installment_amount > 0),
  total_installments INTEGER NOT NULL CHECK (total_installments > 0),
  paid_installments INTEGER NOT NULL DEFAULT 0 CHECK (paid_installments >= 0 AND paid_installments <= total_installments),
  start_date DATE NOT NULL,
  due_day INTEGER NOT NULL CHECK (due_day BETWEEN 1 AND 31),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. GOLD_TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.gold_transactions (
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

-- 4. USER_SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  gold_price_per_gram NUMERIC(18, 2) NOT NULL DEFAULT 7500000 CHECK (gold_price_per_gram >= 0),
  theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'system')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. INDEXES
CREATE INDEX IF NOT EXISTS transactions_user_occurred_idx ON public.transactions (user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS transactions_user_type_idx ON public.transactions (user_id, type);
CREATE INDEX IF NOT EXISTS installment_plans_user_idx ON public.installment_plans (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS gold_transactions_user_occurred_idx ON public.gold_transactions (user_id, occurred_at DESC);

-- 6. TRIGGER FUNCTION for updated_at
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

-- 7. TRIGGERS
DROP TRIGGER IF EXISTS transactions_set_updated_at ON public.transactions;
CREATE TRIGGER transactions_set_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS installment_plans_set_updated_at ON public.installment_plans;
CREATE TRIGGER installment_plans_set_updated_at BEFORE UPDATE ON public.installment_plans FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS gold_transactions_set_updated_at ON public.gold_transactions;
CREATE TRIGGER gold_transactions_set_updated_at BEFORE UPDATE ON public.gold_transactions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS user_settings_set_updated_at ON public.user_settings;
CREATE TRIGGER user_settings_set_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 8. REALTIME SETUP
ALTER TABLE public.transactions REPLICA IDENTITY FULL;
ALTER TABLE public.installment_plans REPLICA IDENTITY FULL;
ALTER TABLE public.gold_transactions REPLICA IDENTITY FULL;
ALTER TABLE public.user_settings REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'transactions') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'installment_plans') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.installment_plans;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'gold_transactions') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.gold_transactions;
  END IF;
END $$;

COMMIT;
```

4. اجرا ✅
5. منتظر بمان تا تمام شود

### 2.2 بررسی جداول

- [ ] برو به Data Editor
- [ ] ببین 4 جدول: `transactions`, `installment_plans`, `gold_transactions`, `user_settings`
- [ ] هر جدول columns درست دارد؟

---

## 🔐 مرحله 3: فعال کردن Row Level Security (10 دقیقه)

### 3.1 RLS Activation

1. SQL Editor → New Query
2. کپی این:

```sql
-- ============================================
-- Row Level Security Policies
-- ============================================

-- 1. TRANSACTIONS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own transactions" ON public.transactions;
CREATE POLICY "Users manage own transactions"
  ON public.transactions
  FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- 2. INSTALLMENT_PLANS
ALTER TABLE public.installment_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own installment plans" ON public.installment_plans;
CREATE POLICY "Users manage own installment plans"
  ON public.installment_plans
  FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- 3. GOLD_TRANSACTIONS
ALTER TABLE public.gold_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own gold transactions" ON public.gold_transactions;
CREATE POLICY "Users manage own gold transactions"
  ON public.gold_transactions
  FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- 4. USER_SETTINGS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own settings" ON public.user_settings;
CREATE POLICY "Users manage own settings"
  ON public.user_settings
  FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
```

3. اجرا ✅

### 3.2 بررسی RLS

- [ ] برو به Authentication → Policies
- [ ] برای هر جدول، 1 policy باید نمایش داده شود
- [ ] Status: "Enabled" ✅

---

## 🔑 مرحله 4: تنظیم Authentication (5 دقیقه)

### 4.1 Email Provider

- [ ] برو به Authentication → Providers
- [ ] Email: فعال است? ✅
- [ ] (اگر خاموش است → Enable کن)

### 4.2 Redirect URLs

- [ ] برو به Authentication → URL Configuration
- [ ] اضافه کن Redirect URLs:

```
http://localhost:5173
http://localhost:3000
https://your-domain.vercel.app
https://www.your-domain.vercel.app
```

- [ ] Save ✅

### 4.3 Email Templates (Optional)

- [ ] برو به Authentication → Email Templates
- [ ] OTP template را بررسی کن
- [ ] (می‌توانید متن را سفارشی کنید)

---

## 💻 مرحله 5: تنظیم React Project (10 دقیقه)

### 5.1 نصب Package

```bash
npm install @supabase/supabase-js
```

- [ ] اتمام ✅

### 5.2 ایجاد `.env.local`

در ریشه پروژه، فایل جدید:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

- [ ] مقادیر درست جایگزین شده‌اند
- [ ] فایل `.gitignore` شامل `.env.local` است ✅

### 5.3 سرویس Supabase

ایجاد `src/services/supabase.ts`:

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
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: { eventsPerSecond: 10 },
    },
  },
);
```

- [ ] فایل ایجاد شد ✅

### 5.4 Types/Database

ایجاد `src/types/database.ts`:

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

- [ ] فایل ایجاد شد ✅

### 5.5 Domain Types

ایجاد `src/types/domain.ts`:

```typescript
export interface Transaction {
  id: string;
  user_id: string;
  type: "income" | "side_income" | "expense";
  title: string;
  amount: number;
  occurred_at: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InstallmentPlan {
  id: string;
  user_id: string;
  title: string;
  total_amount: number;
  installment_amount: number;
  total_installments: number;
  paid_installments: number;
  start_date: string;
  due_day: number;
  created_at: string;
  updated_at: string;
}

export interface GoldTransaction {
  id: string;
  user_id: string;
  type: "buy" | "sell";
  grams: number;
  price_per_gram: number;
  occurred_at: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  user_id: string;
  gold_price_per_gram: number;
  theme: "dark" | "light" | "system";
  created_at: string;
  updated_at: string;
}

export interface FinanceSnapshot {
  transactions: Transaction[];
  installmentPlans: InstallmentPlan[];
  goldTransactions: GoldTransaction[];
  settings: UserSettings;
}

export interface QueueItem {
  id: string;
  table:
    | "transactions"
    | "installment_plans"
    | "gold_transactions"
    | "user_settings";
  action: "insert" | "update" | "delete";
  payload: Record<string, unknown>;
  timestamp: number;
}
```

- [ ] فایل ایجاد شد ✅

### 5.6 Finance Service

ایجاد `src/services/finance-service.ts`:

```typescript
import { supabase } from "./supabase";
import type {
  FinanceSnapshot,
  GoldTransaction,
  InstallmentPlan,
  QueueItem,
  Transaction,
  UserSettings,
} from "@/types/domain";

function errorMessage(error: { message: string } | null): string {
  return error?.message ?? "خطای ناشناخته";
}

export async function fetchFinanceSnapshot(
  userId: string,
): Promise<FinanceSnapshot> {
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

  const failure =
    transactions.error ?? plans.error ?? gold.error ?? settings.error;
  if (failure) throw new Error(errorMessage(failure));

  const now = new Date().toISOString();
  return {
    transactions: transactions.data ?? [],
    installmentPlans: plans.data ?? [],
    goldTransactions: gold.data ?? [],
    settings: settings.data ?? {
      user_id: userId,
      gold_price_per_gram: 0,
      theme: "dark",
      created_at: now,
      updated_at: now,
    },
  };
}

export async function upsertTransaction(
  row: Transaction,
): Promise<Transaction> {
  const { data, error } = await supabase
    .from("transactions")
    .upsert(row)
    .select()
    .single();
  if (error) throw new Error(errorMessage(error));
  return data;
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw new Error(errorMessage(error));
}

export async function upsertInstallment(
  row: InstallmentPlan,
): Promise<InstallmentPlan> {
  const { data, error } = await supabase
    .from("installment_plans")
    .upsert(row)
    .select()
    .single();
  if (error) throw new Error(errorMessage(error));
  return data;
}

export async function deleteInstallment(id: string): Promise<void> {
  const { error } = await supabase
    .from("installment_plans")
    .delete()
    .eq("id", id);
  if (error) throw new Error(errorMessage(error));
}

export async function upsertGoldTransaction(
  row: GoldTransaction,
): Promise<GoldTransaction> {
  const { data, error } = await supabase
    .from("gold_transactions")
    .upsert(row)
    .select()
    .single();
  if (error) throw new Error(errorMessage(error));
  return data;
}

export async function deleteGoldTransaction(id: string): Promise<void> {
  const { error } = await supabase
    .from("gold_transactions")
    .delete()
    .eq("id", id);
  if (error) throw new Error(errorMessage(error));
}

export async function upsertSettings(row: UserSettings): Promise<UserSettings> {
  const { data, error } = await supabase
    .from("user_settings")
    .upsert(row)
    .select()
    .single();
  if (error) throw new Error(errorMessage(error));
  return data;
}
```

- [ ] فایل ایجاد شد ✅

---

## ✅ مرحله 6: تست سریع (5 دقیقه)

### 6.1 بررسی Connection

```typescript
// در کنسول مرورگر:
import { supabase, isSupabaseConfigured } from "./services/supabase";

console.log("Configured:", isSupabaseConfigured);
// باید نتیجه بدهد: Configured: true
```

- [ ] نمایش `true` ✅

### 6.2 بررسی Auth

```typescript
// Login Test
const { error } = await supabase.auth.signInWithOtp({
  email: "test@example.com",
});
// باید OTP ایمیل بگیری
```

- [ ] ایمیل دریافت شد ✅

### 6.3 بررسی Database

```typescript
// بعد از تأیید OTP، بررسی کن:
const { data } = await supabase.from("transactions").select("*");

console.log("Transactions:", data);
// باید خالی بدهد (یا داده‌های موجود اگر الان‌ دارند)
```

- [ ] بدون خطا کار کرد ✅

---

## 📊 مرحله 7: Monitoring (اختیاری)

### 7.1 Supabase Dashboard

- [ ] برو به Analytics
- [ ] ببین API calls
- [ ] ببین Database health

### 7.2 Vercel Dashboard (اگر Deployed)

- [ ] برو به Deployments
- [ ] فیلتر کن environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

---

## 🎉 تمام!

### فهرست نهایی:

✅ Supabase Project ایجاد شد  
✅ Database Schema تنظیم شد  
✅ Row Level Security فعال است  
✅ Authentication آماده است  
✅ React Project متصل است  
✅ تست‌ها گذرانده شد  
✅ آماده برای Development!

---

### 📞 در صورت مشکل:

| مشکل                          | حل                                         |
| ----------------------------- | ------------------------------------------ |
| "SUPABASE_URL is undefined"   | `.env.local` را بررسی کن                   |
| "User not authenticated"      | Login صفحه را تست کن                       |
| "RLS policy violation"        | بررسی کن `user_id` درست است                |
| "Realtime not working"        | بررسی کن `REPLICA IDENTITY FULL` تنظیم شده |
| "Database connection timeout" | Supabase status page را بررسی کن           |

---

**نسخه**: 1.0  
**آخرین بروزرسانی**: 2026-09-09  
**زمان کل تنظیم**: ~40 دقیقه ✅
