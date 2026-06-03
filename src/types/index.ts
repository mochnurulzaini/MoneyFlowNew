export type TransactionType = 'income' | 'expense'
export type Theme = 'light' | 'dark' | 'system'
export type PeriodType = 'monthly' | 'weekly'

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  categoryId: string
  description: string
  date: string          // ISO string
  notes?: string
}

export interface Category {
  id: string
  name: string
  icon: string          // Lucide icon name
  color: string         // hex
  type: 'income' | 'expense' | 'both'
}

export interface Budget {
  id: string
  categoryId: string
  amount: number
  period: PeriodType
}

export interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline?: string
  icon: string
  color: string
}

export interface AppSettings {
  currency: string
  theme: Theme
  language: string
}
