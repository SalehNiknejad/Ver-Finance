# 🎯 راهنمای عملی: استفاده از Supabase در پروژه‌های مالی

_مثال‌های واقعی و الگو‌های کد برای پروژه‌های جدید_

---

## 🎬 فیلوی کار (Workflows)

### Workflow 1: کاربر جدید → ثبت نام → اضافه کردن تراکنش

```
1. کاربر روی "Sign Up" کلیک می‌کند
   ↓
2. Email را وارد می‌کند
   ↓
3. Supabase OTP کد می‌فرستد
   ↓
4. کاربر کد را تأیید می‌کند
   ↓
5. Supabase Session ایجاد می‌کند (localStorage)
   ↓
6. user_settings جدید ایجاد می‌شود (gold_price_per_gram = پیش‌فرض)
   ↓
7. کاربر dashboard را می‌بیند (خالی)
   ↓
8. کاربر "Add Transaction" کلیک می‌کند
   ↓
9. Form پرپر می‌شود (title, amount, type)
   ↓
10. در جدول transactions ذخیره می‌شود (RLS اطمینان می‌دهد user_id درست است)
   ↓
11. Dashboard بطور خودکار بروزرسانی می‌شود (Realtime)
```

### Workflow 2: نمایش Dashboard

```
1. کاربر Dashboard صفحه را بازمی‌کند
   ↓
2. Hook: useFinanceSync() تمام داده‌ها را می‌خواند:
   - transactions
   - installment_plans
   - gold_transactions
   - user_settings
   ↓
3. داده‌ها در Store (Finance Store) ذخیره می‌شوند
   ↓
4. Components بروزرسانی می‌شوند:
   - Chart: Income vs Expenses
   - Card: Total Assets
   - Card: Gold Holdings
   - List: Upcoming Installments
   ↓
5. Realtime Listener فعال می‌شود
   (اگر کاربر در تب دیگر تراکنش اضافه کند، خودکار refresh می‌شود)
```

---

## 📝 مثال کد: تمام عملیات CRUD

### 1️⃣ CREATE: اضافه کردن تراکنش جدید

```typescript
// src/features/transactions/transaction-form.tsx
import { upsertTransaction } from '@/services/finance-service'
import { useFinanceStore } from '@/store/finance-store'
import { useAuth } from '@/hooks/use-auth'

export function TransactionForm() {
  const { user } = useAuth()
  const { addTransaction } = useFinanceStore()
  const [formData, setFormData] = useState({
    type: 'expense' as const,
    title: '',
    amount: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!user) {
      alert('لطفا وارد شوید')
      return
    }

    // Validation
    if (!formData.title.trim() || !formData.amount) {
      alert('تمام فیلدها الزامی هستند')
      return
    }

    setLoading(true)
    try {
      const transaction = {
        id: crypto.randomUUID(),
        user_id: user.id,
        type: formData.type,
        title: formData.title.trim(),
        amount: parseFloat(formData.amount),
        occurred_at: new Date().toISOString(),
        notes: formData.notes.trim() || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // ذخیره در Supabase
      const saved = await upsertTransaction(transaction)

      // بروزرسانی Store
      addTransaction(saved)

      // پاک کردن Form
      setFormData({ type: 'expense', title: '', amount: '', notes: '' })

      alert('تراکنش با موفقیت اضافه شد')
    } catch (error) {
      alert(`خطا: ${error instanceof Error ? error.message : 'نامشخص'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>نوع</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({...formData, type: e.target.value as 'income' | 'side_income' | 'expense'})}
        >
          <option value="income">درآمد</option>
          <option value="side_income">درآمد فرعی</option>
          <option value="expense">هزینه</option>
        </select>
      </div>

      <div>
        <label>توضیح</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          placeholder="مثال: حقوق ماهانه"
          maxLength={120}
          required
        />
      </div>

      <div>
        <label>مبلغ</label>
        <input
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({...formData, amount: e.target.value})}
          placeholder="مثال: 1000000"
          step="0.01"
          min="0"
          required
        />
      </div>

      <div>
        <label>یادداشت (اختیاری)</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          placeholder="توضیحات اضافی"
          rows={3}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary w-full"
      >
        {loading ? 'در حال ذخیره...' : 'اضافه کردن تراکنش'}
      </button>
    </form>
  )
}
```

### 2️⃣ READ: دریافت تراکنش‌ها

```typescript
// src/hooks/use-finance-sync.ts
import { useEffect } from "react";
import { useAuth } from "./use-auth";
import { useFinanceStore } from "@/store/finance-store";
import { fetchFinanceSnapshot } from "@/services/finance-service";
import { supabase } from "@/services/supabase";

export function useFinanceSync() {
  const { user } = useAuth();
  const { setSnapshot } = useFinanceStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // بارگذاری اولیه
  useEffect(() => {
    if (!user) return;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const snapshot = await fetchFinanceSnapshot(user.id);
        setSnapshot(snapshot);
      } catch (err) {
        setError(err instanceof Error ? err.message : "خطای نامشخص");
      } finally {
        setLoading(false);
      }
    }

    load();

    // Realtime Listener: تراکنش‌های جدید
    const channel = supabase
      .channel("transactions-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Transaction updated:", payload);
          // Refresh داده‌ها
          load();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { loading, error };
}
```

### 3️⃣ UPDATE: ویرایش تراکنش

```typescript
// مثال: ویرایش مبلغ تراکنش
async function editTransaction(transactionId: string, newAmount: number) {
  if (!user) return;

  try {
    const updated = await upsertTransaction({
      id: transactionId,
      user_id: user.id,
      // ... سایر فیلدها
      amount: newAmount,
      updated_at: new Date().toISOString(),
    });

    updateTransaction(updated);
    alert("تراکنش ویرایش شد");
  } catch (error) {
    alert(`خطا: ${error}`);
  }
}
```

### 4️⃣ DELETE: حذف تراکنش

```typescript
// مثال: حذف تراکنش
async function handleDeleteTransaction(transactionId: string) {
  if (!confirm("آیا اطمینان دارید؟")) return;

  try {
    await deleteTransaction(transactionId);
    removeTransaction(transactionId);
    alert("تراکنش حذف شد");
  } catch (error) {
    alert(`خطا: ${error}`);
  }
}
```

---

## 💾 Store Pattern: Zustand

```typescript
// src/store/finance-store.ts
import { create } from "zustand";
import type { FinanceSnapshot, Transaction } from "@/types/domain";

interface FinanceStore {
  snapshot: FinanceSnapshot | null;
  setSnapshot: (snapshot: FinanceSnapshot) => void;
  addTransaction: (t: Transaction) => void;
  updateTransaction: (t: Transaction) => void;
  removeTransaction: (id: string) => void;

  // Computed values
  totalIncome: () => number;
  totalExpense: () => number;
  netWorth: () => number;
}

export const useFinanceStore = create<FinanceStore>((set, get) => ({
  snapshot: null,

  setSnapshot: (snapshot) => set({ snapshot }),

  addTransaction: (transaction) =>
    set((state) => ({
      snapshot: state.snapshot
        ? {
            ...state.snapshot,
            transactions: [transaction, ...state.snapshot.transactions],
          }
        : null,
    })),

  updateTransaction: (transaction) =>
    set((state) => ({
      snapshot: state.snapshot
        ? {
            ...state.snapshot,
            transactions: state.snapshot.transactions.map((t) =>
              t.id === transaction.id ? transaction : t,
            ),
          }
        : null,
    })),

  removeTransaction: (id) =>
    set((state) => ({
      snapshot: state.snapshot
        ? {
            ...state.snapshot,
            transactions: state.snapshot.transactions.filter(
              (t) => t.id !== id,
            ),
          }
        : null,
    })),

  totalIncome: () => {
    const snapshot = get().snapshot;
    return (
      snapshot?.transactions
        .filter((t) => t.type === "income" || t.type === "side_income")
        .reduce((sum, t) => sum + t.amount, 0) ?? 0
    );
  },

  totalExpense: () => {
    const snapshot = get().snapshot;
    return (
      snapshot?.transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0) ?? 0
    );
  },

  netWorth: () => {
    return get().totalIncome() - get().totalExpense();
  },
}));
```

---

## 🔐 Authentication Flow

```typescript
// src/pages/login-page.tsx
import { useState } from 'react'
import { supabase } from '@/services/supabase'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleLogin() {
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: window.location.origin,
        },
      })

      if (error) throw error

      setMessage('✅ کد تأیید برای شما ارسال شد')
      setEmail('')
    } catch (error) {
      setMessage(`❌ ${error instanceof Error ? error.message : 'خطا'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <h1>ورود به VerTwo</h1>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        disabled={loading}
      />

      <button
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? 'در حال ارسال...' : 'دریافت کد تأیید'}
      </button>

      {message && <p>{message}</p>}
    </div>
  )
}
```

---

## 📊 نمایش Dashboard

```typescript
// src/pages/dashboard-page.tsx
import { useEffect } from 'react'
import { useFinanceSync } from '@/hooks/use-finance-sync'
import { useFinanceStore } from '@/store/finance-store'
import { CashflowChart } from '@/features/dashboard/cashflow-chart'
import { MetricCard } from '@/features/dashboard/metric-card'

export function DashboardPage() {
  const { loading, error } = useFinanceSync()
  const { snapshot, totalIncome, totalExpense, netWorth } = useFinanceStore()

  if (loading) return <div>درحال بارگذاری...</div>
  if (error) return <div className="error">خطا: {error}</div>
  if (!snapshot) return <div>داده‌ای موجود نیست</div>

  return (
    <div className="dashboard">
      <h1>خلاصه مالی</h1>

      <div className="metrics-grid">
        <MetricCard
          title="درآمد کل"
          value={totalIncome()}
          color="green"
        />
        <MetricCard
          title="هزینه کل"
          value={totalExpense()}
          color="red"
        />
        <MetricCard
          title="تراز"
          value={netWorth()}
          color={netWorth() >= 0 ? 'green' : 'red'}
        />
      </div>

      <CashflowChart transactions={snapshot.transactions} />

      {snapshot.installmentPlans.length > 0 && (
        <div className="installments-section">
          <h2>اقساط</h2>
          {/* نمایش اقساط فعال */}
        </div>
      )}

      {snapshot.goldTransactions.length > 0 && (
        <div className="gold-section">
          <h2>سرمایه‌گذاری طلا</h2>
          {/* نمایش سرمایه‌گذاری‌های طلا */}
        </div>
      )}
    </div>
  )
}
```

---

## 🎯 نکات مهم

### ✅ Security Checklist

- [x] Environment variables در `.env.local` (گنجانده در `.gitignore`)
- [x] RLS Policies برای تمام جداول فعال
- [x] Anon Key فقط برای کلینت استفاده می‌شود
- [x] Server secret key هرگز در کد نیست
- [x] User.id بطور خودکار از auth.uid() کپی می‌شود

### ✅ Performance Tips

- [x] Indexes برای `user_id` و `occurred_at`
- [x] `.select('*')` تنها fields لازم را می‌خوانند
- [x] Batch queries با `Promise.all()`
- [x] Realtime listeners تنها برای اطلاعات فعال

### ✅ Error Handling

```typescript
try {
  // عملیات
} catch (error) {
  const message = error instanceof Error ? error.message : "خطای ناشناخته";

  // Log کن
  console.error("Finance Error:", message);

  // Show to user
  setError(message);

  // Retry logic (اگر لازم است)
  if (error.code === "NETWORK_ERROR") {
    // offline-db استفاده کن
  }
}
```

---

## 🔄 Offline Support (Optional)

برای پروژه‌های با نیاز offline:

```typescript
// src/services/offline-db.ts
import Dexie from "dexie";

export const offlineDb = new Dexie("VerTwoFinance");
offlineDb.version(1).stores({
  transactions: "++id, user_id, occurred_at",
  installment_plans: "++id, user_id",
  gold_transactions: "++id, user_id",
  queue: "++id, table, action", // Queue برای sync
});

// هنگام offline، داده‌ها به Dexie ذخیره می‌شوند
// وقتی online شود، Queue اجرا می‌شود
```

---

## 📚 Cheat Sheet: SQL Queries

```sql
-- تمام تراکنش‌های یک کاربر
SELECT * FROM transactions
WHERE user_id = 'user-uuid'
ORDER BY occurred_at DESC;

-- کل درآمد
SELECT SUM(amount) FROM transactions
WHERE user_id = 'user-uuid' AND type IN ('income', 'side_income');

-- کل هزینه
SELECT SUM(amount) FROM transactions
WHERE user_id = 'user-uuid' AND type = 'expense';

-- اقساط نزدیک سررسید
SELECT * FROM installment_plans
WHERE user_id = 'user-uuid'
  AND paid_installments < total_installments
ORDER BY start_date ASC;

-- وزن کل طلا
SELECT SUM(CASE
  WHEN type = 'buy' THEN grams
  ELSE -grams
END) as total_grams
FROM gold_transactions
WHERE user_id = 'user-uuid';
```

---

**آخرین بروزرسانی**: 2026-09-09  
**نسخه**: 1.0  
**وضعیت**: آماده برای Copy-Paste ✅
