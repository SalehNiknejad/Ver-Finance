import { create } from "zustand";
import { toast } from "sonner";
import { demoSnapshot } from "@/lib/demo-data";
import { createId } from "@/lib/utils";
import {
  cacheSnapshot,
  enqueueMutation,
  getCachedSnapshot,
  getQueuedMutations,
  removeQueuedMutation,
} from "@/services/offline-db";
import {
  deleteGoldTransaction,
  deleteInstallment,
  deleteTransaction,
  fetchFinanceSnapshot,
  replayMutation,
  upsertGoldTransaction,
  upsertInstallment,
  upsertSettings,
  upsertTransaction,
} from "@/services/finance-service";
import { isSupabaseConfigured } from "@/services/supabase";
import type {
  FinanceSnapshot,
  GoldTransaction,
  InstallmentPlan,
  NewGoldTransaction,
  NewInstallmentPlan,
  NewTransaction,
  SyncTable,
  Transaction,
  UserSettings,
} from "@/types/domain";

interface FinanceState extends FinanceSnapshot {
  userId: string | null;
  loading: boolean;
  syncing: boolean;
  isOnline: boolean;
  error: string | null;
  initialize: (userId: string) => Promise<void>;
  setOnline: (online: boolean) => void;
  syncQueue: () => Promise<void>;
  addTransaction: (input: NewTransaction) => Promise<void>;
  updateTransaction: (row: Transaction) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  addInstallment: (input: NewInstallmentPlan) => Promise<void>;
  updateInstallment: (row: InstallmentPlan) => Promise<void>;
  removeInstallment: (id: string) => Promise<void>;
  addGoldTransaction: (input: NewGoldTransaction) => Promise<void>;
  updateGoldTransaction: (row: GoldTransaction) => Promise<void>;
  removeGoldTransaction: (id: string) => Promise<void>;
  updateSettings: (
    patch: Partial<Pick<UserSettings, "gold_price_per_gram" | "theme">>,
  ) => Promise<void>;
  mergeRealtime: (
    table: SyncTable,
    event: "INSERT" | "UPDATE" | "DELETE",
    row: Record<string, unknown>,
    oldRow: Record<string, unknown>,
  ) => void;
}

const emptySnapshot: FinanceSnapshot = {
  transactions: [],
  installmentPlans: [],
  goldTransactions: [],
  settings: {
    user_id: "",
    gold_price_per_gram: 7500000,
    theme: "dark",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};
const now = (): string => new Date().toISOString();
const canSync = (): boolean => isSupabaseConfigured && navigator.onLine;
const record = <T extends object>(value: T): Record<string, unknown> =>
  value as unknown as Record<string, unknown>;

export const useFinanceStore = create<FinanceState>((set, get) => {
  const persist = (): void => {
    const {
      userId,
      transactions,
      installmentPlans,
      goldTransactions,
      settings,
    } = get();
    if (userId)
      void cacheSnapshot(userId, {
        transactions,
        installmentPlans,
        goldTransactions,
        settings,
      });
  };

  const queue = async (
    table: SyncTable,
    action: "upsert" | "delete",
    payload: Record<string, unknown>,
  ): Promise<void> => {
    await enqueueMutation({ table, action, payload });
    toast.info("تغییر ذخیره شد و پس از اتصال همگام می‌شود");
  };

  return {
    ...emptySnapshot,
    userId: null,
    loading: true,
    syncing: false,
    isOnline: navigator.onLine,
    error: null,
    initialize: async (userId) => {
      set({ userId, loading: true, error: null });
      const cached = await getCachedSnapshot(userId);
      if (cached) {
        set({ ...cached, loading: false });
      }
      if (!isSupabaseConfigured) {
        if (!cached) set({ ...demoSnapshot, loading: false });
        persist();
        return;
      }
      if (!navigator.onLine) {
        set({ loading: false });
        return;
      }
      try {
        const snapshot = await fetchFinanceSnapshot(userId);
        set({ ...snapshot, loading: false });
        persist();
        await get().syncQueue();
      } catch (error) {
        set({
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "دریافت اطلاعات ناموفق بود",
        });
      }
    },
    setOnline: (isOnline) => set({ isOnline }),
    syncQueue: async () => {
      if (!canSync() || get().syncing) return;
      set({ syncing: true });
      try {
        const items = await getQueuedMutations();
        for (const item of items) {
          await replayMutation(item);
          if (item.id !== undefined) await removeQueuedMutation(item.id);
        }
        if (items.length > 0) toast.success("تغییرات آفلاین همگام شد");
      } catch {
        toast.error("بخشی از تغییرات هنوز همگام نشده است");
      } finally {
        set({ syncing: false });
      }
    },
    addTransaction: async (input) => {
      const userId = get().userId;
      if (!userId) return;
      const row: Transaction = {
        ...input,
        id: createId(),
        user_id: userId,
        created_at: now(),
        updated_at: now(),
      };
      set((state) => ({ transactions: [row, ...state.transactions] }));
      persist();
      try {
        if (canSync()) await upsertTransaction(row);
        else await queue("transactions", "upsert", record(row));
      } catch {
        await queue("transactions", "upsert", record(row));
      }
    },
    updateTransaction: async (row) => {
      const updated = { ...row, updated_at: now() };
      set((state) => ({
        transactions: state.transactions.map((item) =>
          item.id === row.id ? updated : item,
        ),
      }));
      persist();
      try {
        if (canSync()) await upsertTransaction(updated);
        else await queue("transactions", "upsert", record(updated));
      } catch {
        await queue("transactions", "upsert", record(updated));
      }
    },
    removeTransaction: async (id) => {
      set((state) => ({
        transactions: state.transactions.filter((item) => item.id !== id),
      }));
      persist();
      try {
        if (canSync()) await deleteTransaction(id);
        else await queue("transactions", "delete", { id });
      } catch {
        await queue("transactions", "delete", { id });
      }
    },
    addInstallment: async (input) => {
      const userId = get().userId;
      if (!userId) return;
      const row: InstallmentPlan = {
        ...input,
        id: createId(),
        user_id: userId,
        created_at: now(),
        updated_at: now(),
      };
      set((state) => ({ installmentPlans: [row, ...state.installmentPlans] }));
      persist();
      try {
        if (canSync()) await upsertInstallment(row);
        else await queue("installment_plans", "upsert", record(row));
      } catch {
        await queue("installment_plans", "upsert", record(row));
      }
    },
    updateInstallment: async (row) => {
      const updated = { ...row, updated_at: now() };
      set((state) => ({
        installmentPlans: state.installmentPlans.map((item) =>
          item.id === row.id ? updated : item,
        ),
      }));
      persist();
      try {
        if (canSync()) await upsertInstallment(updated);
        else await queue("installment_plans", "upsert", record(updated));
      } catch {
        await queue("installment_plans", "upsert", record(updated));
      }
    },
    removeInstallment: async (id) => {
      set((state) => ({
        installmentPlans: state.installmentPlans.filter(
          (item) => item.id !== id,
        ),
      }));
      persist();
      try {
        if (canSync()) await deleteInstallment(id);
        else await queue("installment_plans", "delete", { id });
      } catch {
        await queue("installment_plans", "delete", { id });
      }
    },
    addGoldTransaction: async (input) => {
      const userId = get().userId;
      if (!userId) return;
      const row: GoldTransaction = {
        ...input,
        id: createId(),
        user_id: userId,
        created_at: now(),
        updated_at: now(),
      };
      set((state) => ({ goldTransactions: [row, ...state.goldTransactions] }));
      persist();
      try {
        if (canSync()) await upsertGoldTransaction(row);
        else await queue("gold_transactions", "upsert", record(row));
      } catch {
        await queue("gold_transactions", "upsert", record(row));
      }
    },
    updateGoldTransaction: async (row) => {
      const updated = { ...row, updated_at: now() };
      set((state) => ({
        goldTransactions: state.goldTransactions.map((item) =>
          item.id === row.id ? updated : item,
        ),
      }));
      persist();
      try {
        if (canSync()) await upsertGoldTransaction(updated);
        else await queue("gold_transactions", "upsert", record(updated));
      } catch {
        await queue("gold_transactions", "upsert", record(updated));
      }
    },
    removeGoldTransaction: async (id) => {
      set((state) => ({
        goldTransactions: state.goldTransactions.filter(
          (item) => item.id !== id,
        ),
      }));
      persist();
      try {
        if (canSync()) await deleteGoldTransaction(id);
        else await queue("gold_transactions", "delete", { id });
      } catch {
        await queue("gold_transactions", "delete", { id });
      }
    },
    updateSettings: async (patch) => {
      const settings = { ...get().settings, ...patch, updated_at: now() };
      set({ settings });
      persist();
      try {
        if (canSync()) await upsertSettings(settings);
        else await queue("user_settings", "upsert", record(settings));
      } catch {
        await queue("user_settings", "upsert", record(settings));
      }
    },
    mergeRealtime: (table, event, row, oldRow) => {
      const removeId = typeof oldRow.id === "string" ? oldRow.id : "";
      if (table === "transactions")
        set((state) => ({
          transactions: mergeRows(
            state.transactions,
            event,
            row as unknown as Transaction,
            removeId,
          ),
        }));
      if (table === "installment_plans")
        set((state) => ({
          installmentPlans: mergeRows(
            state.installmentPlans,
            event,
            row as unknown as InstallmentPlan,
            removeId,
          ),
        }));
      if (table === "gold_transactions")
        set((state) => ({
          goldTransactions: mergeRows(
            state.goldTransactions,
            event,
            row as unknown as GoldTransaction,
            removeId,
          ),
        }));
      if (table === "user_settings" && event !== "DELETE")
        set({ settings: row as unknown as UserSettings });
      persist();
    },
  };
});

function mergeRows<T extends { id: string }>(
  rows: T[],
  event: "INSERT" | "UPDATE" | "DELETE",
  row: T,
  oldId: string,
): T[] {
  if (event === "DELETE") return rows.filter((item) => item.id !== oldId);
  const exists = rows.some((item) => item.id === row.id);
  return exists
    ? rows.map((item) => (item.id === row.id ? row : item))
    : [row, ...rows];
}
