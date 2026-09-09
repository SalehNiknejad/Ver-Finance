-- RLS (Row Level Security) Policies for VerTwo Finance
-- اجرا کن این script در Supabase SQL Editor

-- =============================================
-- 1. TRANSACTIONS TABLE
-- =============================================

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- سیاست انتخاب
CREATE POLICY "Users can view own transactions"
  ON public.transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- سیاست درج
CREATE POLICY "Users can insert own transactions"
  ON public.transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- سیاست به‌روزرسانی
CREATE POLICY "Users can update own transactions"
  ON public.transactions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- سیاست حذف
CREATE POLICY "Users can delete own transactions"
  ON public.transactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- 2. INSTALLMENT_PLANS TABLE
-- =============================================

ALTER TABLE public.installment_plans ENABLE ROW LEVEL SECURITY;

-- سیاست انتخاب
CREATE POLICY "Users can view own installment plans"
  ON public.installment_plans
  FOR SELECT
  USING (auth.uid() = user_id);

-- سیاست درج
CREATE POLICY "Users can insert own installment plans"
  ON public.installment_plans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- سیاست به‌روزرسانی
CREATE POLICY "Users can update own installment plans"
  ON public.installment_plans
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- سیاست حذف
CREATE POLICY "Users can delete own installment plans"
  ON public.installment_plans
  FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- 3. GOLD_INVESTMENTS TABLE (اگر موجود است)
-- =============================================

-- اگر این جدول وجود دارد، RLS را فعال کن
-- ALTER TABLE public.gold_investments ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can view own gold investments"
--   ON public.gold_investments
--   FOR SELECT
--   USING (auth.uid() = user_id);

-- CREATE POLICY "Users can insert own gold investments"
--   ON public.gold_investments
--   FOR INSERT
--   WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Users can update own gold investments"
--   ON public.gold_investments
--   FOR UPDATE
--   USING (auth.uid() = user_id)
--   WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Users can delete own gold investments"
--   ON public.gold_investments
--   FOR DELETE
--   USING (auth.uid() = user_id);

-- =============================================
-- تست کردن
-- =============================================

-- بعد از اجرای این script، می‌توانی اینها را تست کنی:

-- 1. مشاهده جداول و policies
SELECT * FROM pg_tables WHERE schemaname = 'public';

-- 2. مشاهده policies برای جدول transactions
SELECT * FROM pg_policies WHERE tablename = 'transactions';
