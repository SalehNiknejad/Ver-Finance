import type { GoldTransaction, InstallmentPlan, Transaction, UserSettings } from './domain'

type Table<Row extends Record<string, unknown>> = {
  Row: Row
  Insert: Row
  Update: Partial<Row>
  Relationships: []
}

export type Database = {
  public: {
    Tables: {
      transactions: Table<Transaction>
      installment_plans: Table<InstallmentPlan>
      gold_transactions: Table<GoldTransaction>
      user_settings: Table<UserSettings>
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
