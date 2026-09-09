# 📚 Supabase API Reference - VerTwo Finance

_معادل سریع برای تمام عملیات رایج_

---

## 🔑 Authentication

### Sign Up با Email OTP

```typescript
const { error } = await supabase.auth.signInWithOtp({
  email: "user@example.com",
  options: {
    emailRedirectTo: window.location.origin,
  },
});

if (error) console.error("SignUp Error:", error.message);
```

### Verify OTP

```typescript
const { data, error } = await supabase.auth.verifyOtp({
  email: "user@example.com",
  token: "otp-code-from-email",
  type: "email",
});

if (data.session) {
  console.log("User signed in successfully");
  // Session تلقائی در localStorage ذخیره می‌شود
}
```

### دریافت Current User

```typescript
const {
  data: { user },
} = await supabase.auth.getUser();

if (user) {
  console.log("User ID:", user.id);
  console.log("Email:", user.email);
}
```

### Logout

```typescript
await supabase.auth.signOut();
// Session از localStorage پاک می‌شود
```

### Listen to Auth Changes

```typescript
supabase.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_IN") {
    console.log("User signed in");
    // refresh data
  } else if (event === "SIGNED_OUT") {
    console.log("User signed out");
    // clear data
  }
});
```

---

## 💰 Transactions API

### Create Transaction

```typescript
const transaction = {
  id: crypto.randomUUID(),
  user_id: user.id, // auto-set by RLS
  type: "expense" as const, // 'income' | 'side_income' | 'expense'
  title: "Groceries",
  amount: 150000,
  occurred_at: new Date().toISOString(),
  notes: "Weekly shopping",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const { data, error } = await supabase
  .from("transactions")
  .insert(transaction)
  .select()
  .single();

if (error) throw new Error(error.message);
return data;
```

### Read Transactions

```typescript
// تمام تراکنش‌های کاربر
const { data, error } = await supabase
  .from("transactions")
  .select("*")
  .eq("user_id", userId)
  .order("occurred_at", { ascending: false });

// فقط تراکنش‌های ماه آخر
const { data, error } = await supabase
  .from("transactions")
  .select("*")
  .eq("user_id", userId)
  .gte(
    "occurred_at",
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  )
  .order("occurred_at", { ascending: false });

// فقط هزینه‌ها
const { data, error } = await supabase
  .from("transactions")
  .select("*")
  .eq("user_id", userId)
  .eq("type", "expense");

// محدود کردن نتایج (pagination)
const { data, error } = await supabase
  .from("transactions")
  .select("*")
  .eq("user_id", userId)
  .range(0, 9); // نتایج 0-9
```

### Update Transaction

```typescript
const { data, error } = await supabase
  .from("transactions")
  .update({
    amount: 200000,
    notes: "Updated amount",
    updated_at: new Date().toISOString(),
  })
  .eq("id", transactionId)
  .select()
  .single();
```

### Upsert Transaction (Insert یا Update)

```typescript
const { data, error } = await supabase
  .from("transactions")
  .upsert({
    id: transactionId,
    user_id: userId,
    title: "Updated Title",
    amount: 300000,
    type: "income",
    // ...
  })
  .select()
  .single();
```

### Delete Transaction

```typescript
const { error } = await supabase
  .from("transactions")
  .delete()
  .eq("id", transactionId);

if (error) throw new Error(error.message);
```

### Batch Operations

```typescript
// ایجاد چندین تراکنش
const transactions = [
  { user_id, type: "income", title: "Salary", amount: 5000000 },
  { user_id, type: "expense", title: "Rent", amount: 1500000 },
  { user_id, type: "expense", title: "Food", amount: 500000 },
];

const { data, error } = await supabase
  .from("transactions")
  .insert(transactions)
  .select();

// حذف چندین تراکنش
const { error } = await supabase
  .from("transactions")
  .delete()
  .in("id", [id1, id2, id3]);
```

### Realtime Listener

```typescript
const channel = supabase
  .channel("transactions-updates")
  .on(
    "postgres_changes",
    {
      event: "*", // 'INSERT' | 'UPDATE' | 'DELETE' | '*'
      schema: "public",
      table: "transactions",
      filter: `user_id=eq.${userId}`,
    },
    (payload) => {
      console.log("Change received!", payload);
      // payload.new = نسخه جدید
      // payload.old = نسخه قدیم
      // payload.eventType = 'INSERT' | 'UPDATE' | 'DELETE'
    },
  )
  .subscribe();

// Unsubscribe
supabase.removeChannel(channel);
```

---

## 📋 Installment Plans API

### Create Installment Plan

```typescript
const plan = {
  id: crypto.randomUUID(),
  user_id: user.id,
  title: "Car Loan",
  total_amount: 30000000,
  installment_amount: 500000,
  total_installments: 60,
  paid_installments: 0,
  start_date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
  due_day: 15, // day of month (1-31)
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const { data, error } = await supabase
  .from("installment_plans")
  .insert(plan)
  .select()
  .single();
```

### Get Active Plans

```typescript
const { data, error } = await supabase
  .from("installment_plans")
  .select("*")
  .eq("user_id", userId)
  .lt("paid_installments", "total_installments") // Incomplete
  .order("start_date", { ascending: true });
```

### Update Paid Installments

```typescript
const { data, error } = await supabase
  .from("installment_plans")
  .update({
    paid_installments: 10,
    updated_at: new Date().toISOString(),
  })
  .eq("id", planId)
  .select()
  .single();
```

### Get Progress Percentage

```typescript
const plan = data[0];
const percentage = (plan.paid_installments / plan.total_installments) * 100;
console.log(`Progress: ${percentage.toFixed(0)}%`);
```

---

## 🏆 Gold Transactions API

### Record Gold Purchase

```typescript
const goldTx = {
  id: crypto.randomUUID(),
  user_id: user.id,
  type: "buy" as const,
  grams: 10.5,
  price_per_gram: 7500000,
  occurred_at: new Date().toISOString(),
  notes: "Bought from shop",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const { data, error } = await supabase
  .from("gold_transactions")
  .insert(goldTx)
  .select()
  .single();
```

### Calculate Total Gold Holdings

```typescript
const { data } = await supabase
  .from("gold_transactions")
  .select("grams, type")
  .eq("user_id", userId);

const totalGrams =
  data?.reduce((sum, tx) => {
    return tx.type === "buy" ? sum + tx.grams : sum - tx.grams;
  }, 0) ?? 0;

console.log(`Total Gold: ${totalGrams} grams`);
```

### Gold Value Calculation

```typescript
const settings = userSettings.gold_price_per_gram; // 7500000
const totalValue = totalGrams * settings;

console.log(`Gold Value: ${totalValue.toLocaleString()} 💰`);
```

### Get Gold Transactions History

```typescript
const { data } = await supabase
  .from("gold_transactions")
  .select("*")
  .eq("user_id", userId)
  .order("occurred_at", { ascending: false });
```

---

## ⚙️ User Settings API

### Get User Settings

```typescript
const { data, error } = await supabase
  .from("user_settings")
  .select("*")
  .eq("user_id", userId)
  .maybeSingle(); // Returns null if not found
```

### Create Settings (First Time)

```typescript
const { data, error } = await supabase
  .from("user_settings")
  .insert({
    user_id: userId,
    gold_price_per_gram: 7500000,
    theme: "dark",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
  .select()
  .single();
```

### Update Settings

```typescript
const { data, error } = await supabase
  .from("user_settings")
  .update({
    gold_price_per_gram: 7600000,
    theme: "light",
    updated_at: new Date().toISOString(),
  })
  .eq("user_id", userId)
  .select()
  .single();
```

### Upsert Settings

```typescript
const { data, error } = await supabase
  .from("user_settings")
  .upsert({
    user_id: userId,
    gold_price_per_gram: 7500000,
    theme: "dark",
  })
  .select()
  .single();
```

---

## 📊 Analytics & Aggregation

### Sum Income by Type

```typescript
// Raw SQL
const { data } = await supabase.rpc("sum_income_by_type", {
  p_user_id: userId,
});

// یا جستجو و محاسبه در client
const { data: transactions } = await supabase
  .from("transactions")
  .select("type, amount")
  .eq("user_id", userId)
  .in("type", ["income", "side_income"]);

const totalIncome = transactions?.reduce((sum, tx) => sum + tx.amount, 0) ?? 0;
```

### Total Expenses by Category

```typescript
const { data: expenses } = await supabase
  .from("transactions")
  .select("title, amount")
  .eq("user_id", userId)
  .eq("type", "expense");

const byTitle =
  expenses?.reduce(
    (acc, tx) => {
      acc[tx.title] = (acc[tx.title] ?? 0) + tx.amount;
      return acc;
    },
    {} as Record<string, number>,
  ) ?? {};

console.log(byTitle);
// { 'Rent': 1500000, 'Food': 500000, ... }
```

### Date Range Query

```typescript
const startDate = "2026-01-01";
const endDate = "2026-12-31";

const { data } = await supabase
  .from("transactions")
  .select("*")
  .eq("user_id", userId)
  .gte("occurred_at", startDate)
  .lte("occurred_at", endDate)
  .order("occurred_at", { ascending: false });
```

---

## 🔍 Advanced Filters

### Multiple Conditions

```typescript
const { data } = await supabase
  .from("transactions")
  .select("*")
  .eq("user_id", userId)
  .eq("type", "expense")
  .gte("amount", 100000)
  .lte("amount", 500000)
  .gte("occurred_at", "2026-01-01")
  .order("amount", { ascending: false });
```

### Fuzzy Search

```typescript
const { data } = await supabase
  .from("transactions")
  .select("*")
  .eq("user_id", userId)
  .ilike("title", `%${searchTerm}%`); // Case insensitive
```

### OR Conditions (با RPC یا Filtering)

```typescript
const { data } = await supabase
  .from("transactions")
  .select("*")
  .eq("user_id", userId)
  .or("type.eq.income,type.eq.side_income");
```

---

## ⚡ Performance Tips

### Pagination

```typescript
const pageSize = 10;
const page = 1;
const start = (page - 1) * pageSize;
const end = start + pageSize - 1;

const { data, count } = await supabase
  .from("transactions")
  .select("*", { count: "exact" })
  .eq("user_id", userId)
  .range(start, end);

console.log(`Showing ${data?.length} of ${count} total`);
```

### Select Specific Columns

```typescript
// فقط columns لازم
const { data } = await supabase
  .from("transactions")
  .select("id, title, amount, occurred_at")
  .eq("user_id", userId);

// بجای
const { data } = await supabase
  .from("transactions")
  .select("*")
  .eq("user_id", userId);
```

### Batch Queries

```typescript
// بجای انجام 4 query جداگانه:
const [trans, plans, gold, settings] = await Promise.all([
  supabase.from("transactions").select("*").eq("user_id", userId),
  supabase.from("installment_plans").select("*").eq("user_id", userId),
  supabase.from("gold_transactions").select("*").eq("user_id", userId),
  supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle(),
]);
```

---

## 🚨 Error Handling

### Error Types

```typescript
try {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    if (error.code === "PGRST116") {
      // Relation not found
    } else if (error.code === "PGRST301") {
      // RLS violation
    }
    throw new Error(error.message);
  }

  return data;
} catch (err) {
  console.error("Database Error:", err);
  // Notify user
}
```

### Type-Safe Errors

```typescript
interface ApiError {
  code: string;
  message: string;
  details: string;
  hint: string;
}

const handleError = (error: ApiError) => {
  const messages: Record<string, string> = {
    PGRST116: "Table not found",
    PGRST301: "You do not have permission to access this data",
    PGRST302: "Authentication required",
  };

  return messages[error.code] ?? error.message;
};
```

---

## 🔄 Realtime Patterns

### Subscribe to Multiple Tables

```typescript
const channel = supabase
  .channel("finance-updates")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "transactions",
      filter: `user_id=eq.${userId}`,
    },
    onTransactionChange,
  )
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "installment_plans",
      filter: `user_id=eq.${userId}`,
    },
    onInstallmentChange,
  )
  .subscribe();
```

### Debounce Realtime Updates

```typescript
let timeout: NodeJS.Timeout;
const handleChange = (payload: any) => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    // Process update
    console.log("Change:", payload);
  }, 500);
};
```

---

## 📱 Offline Support (with Dexie)

### Sync Queue

```typescript
interface QueueItem {
  id: string;
  table: "transactions" | "installment_plans" | "gold_transactions";
  action: "insert" | "update" | "delete";
  payload: Record<string, unknown>;
  timestamp: number;
}

// Save offline
await offlineDb.queue.add({
  id: crypto.randomUUID(),
  table: "transactions",
  action: "insert",
  payload: transaction,
  timestamp: Date.now(),
});

// Sync when online
window.addEventListener("online", async () => {
  const items = await offlineDb.queue.toArray();
  for (const item of items) {
    await replayMutation(item);
    await offlineDb.queue.delete(item.id);
  }
});
```

---

## 📚 Useful Resources

| Resource         | Link                                                     |
| ---------------- | -------------------------------------------------------- |
| Supabase JS Docs | https://supabase.com/docs/reference/javascript           |
| PostgreSQL Docs  | https://www.postgresql.org/docs/                         |
| RLS Guide        | https://supabase.com/docs/guides/auth/row-level-security |
| Realtime         | https://supabase.com/docs/guides/realtime                |

---

**نسخه**: 1.0  
**آخرین بروزرسانی**: 2026-09-09  
**توسط**: VerTwo Finance Team ✅
