import type { FinanceSnapshot } from "@/types/domain";

const now = new Date();
const monthDate = (day: number): string =>
  new Date(now.getFullYear(), now.getMonth(), day, 12).toISOString();
const timestamp = now.toISOString();
const userId = "00000000-0000-0000-0000-000000000001";

export const demoSnapshot: FinanceSnapshot = {
  transactions: [
    {
      id: "demo-income",
      user_id: userId,
      type: "income",
      title: "حقوق ثابت",
      amount: 42_000_000,
      occurred_at: monthDate(1),
      notes: null,
      created_at: timestamp,
      updated_at: timestamp,
    },
    {
      id: "demo-expense",
      user_id: userId,
      type: "expense",
      title: "هزینه‌های ماهانه",
      amount: 8_000_000,
      occurred_at: monthDate(5),
      notes: "هزینه‌های جاری خانه",
      created_at: timestamp,
      updated_at: timestamp,
    },
  ],
  installmentPlans: [
    {
      id: "demo-car",
      user_id: userId,
      title: "قسط خودرو",
      total_amount: 150_000_000,
      installment_amount: 30_000_000,
      total_installments: 5,
      paid_installments: 0,
      start_date: new Date(now.getFullYear(), now.getMonth(), 15)
        .toISOString()
        .slice(0, 10),
      due_day: 15,
      created_at: timestamp,
      updated_at: timestamp,
    },
  ],
  goldTransactions: [],
  settings: {
    user_id: userId,
    gold_price_per_gram: 7_500_000,
    theme: "dark",
    created_at: timestamp,
    updated_at: timestamp,
  },
};
