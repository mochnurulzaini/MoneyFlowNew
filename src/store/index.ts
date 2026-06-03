import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Transaction, Category, Budget, SavingsGoal, AppSettings, Theme } from '../types'
import { uid } from '../utils'

// ─── Default Data ─────────────────────────────────────────────
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'c1',  name: 'Makanan & Minum', icon: 'UtensilsCrossed', color: '#ff4d72', type: 'expense' },
  { id: 'c2',  name: 'Transportasi',     icon: 'Car',             color: '#8b73ff', type: 'expense' },
  { id: 'c3',  name: 'Hiburan',          icon: 'Gamepad2',        color: '#ffb800', type: 'expense' },
  { id: 'c4',  name: 'Belanja',          icon: 'ShoppingBag',     color: '#00e5c3', type: 'expense' },
  { id: 'c5',  name: 'Kesehatan',        icon: 'Heart',           color: '#ff8855', type: 'expense' },
  { id: 'c6',  name: 'Tagihan',          icon: 'Receipt',         color: '#4d9fff', type: 'expense' },
  { id: 'c7',  name: 'Pendidikan',       icon: 'BookOpen',        color: '#a78bfa', type: 'expense' },
  { id: 'c8',  name: 'Lainnya',          icon: 'MoreHorizontal',  color: '#94a3b8', type: 'expense' },
  { id: 'c9',  name: 'Gaji',             icon: 'Wallet',          color: '#00e59a', type: 'income'  },
  { id: 'c10', name: 'Freelance',        icon: 'Laptop',          color: '#8b73ff', type: 'income'  },
  { id: 'c11', name: 'Investasi',        icon: 'TrendingUp',      color: '#4d9fff', type: 'income'  },
  { id: 'c12', name: 'Bonus',            icon: 'Gift',            color: '#ffb800', type: 'income'  },
]

const now = new Date()
const m = now.getMonth()
const y = now.getFullYear()

const DEFAULT_TRANSACTIONS: Transaction[] = [
  { id: uid(), type: 'income',  amount: 8_000_000, categoryId: 'c9',  description: 'Gaji Bulan Ini',      date: new Date(y, m, 1).toISOString() },
  { id: uid(), type: 'expense', amount: 150_000,   categoryId: 'c1',  description: 'Makan siang',          date: new Date(y, m, 2).toISOString() },
  { id: uid(), type: 'expense', amount: 85_000,    categoryId: 'c2',  description: 'Bensin motor',         date: new Date(y, m, 3).toISOString() },
  { id: uid(), type: 'expense', amount: 250_000,   categoryId: 'c4',  description: 'Belanja kebutuhan',    date: new Date(y, m, 4).toISOString() },
  { id: uid(), type: 'income',  amount: 500_000,   categoryId: 'c10', description: 'Freelance desain',     date: new Date(y, m, 5).toISOString() },
  { id: uid(), type: 'expense', amount: 300_000,   categoryId: 'c6',  description: 'Listrik & internet',   date: new Date(y, m, 6).toISOString() },
  { id: uid(), type: 'expense', amount: 120_000,   categoryId: 'c1',  description: 'Makan malam bersama', date: new Date(y, m, 8).toISOString() },
  { id: uid(), type: 'expense', amount: 75_000,    categoryId: 'c3',  description: 'Netflix',              date: new Date(y, m, 10).toISOString() },
  { id: uid(), type: 'expense', amount: 200_000,   categoryId: 'c5',  description: 'Vitamin & suplemen',   date: new Date(y, m, 12).toISOString() },
  { id: uid(), type: 'income',  amount: 1_500_000, categoryId: 'c12', description: 'Bonus proyek',         date: new Date(y, m, 15).toISOString() },
]

const DEFAULT_SETTINGS: AppSettings = {
  currency: 'IDR',
  theme: 'dark',
  language: 'id',
}

// ─── Store Types ──────────────────────────────────────────────
interface AppStore {
  transactions: Transaction[]
  categories: Category[]
  budgets: Budget[]
  savingsGoals: SavingsGoal[]
  settings: AppSettings

  // Transactions
  addTransaction: (t: Omit<Transaction, 'id'>) => void
  updateTransaction: (id: string, t: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void

  // Categories
  addCategory: (c: Omit<Category, 'id'>) => void
  updateCategory: (id: string, c: Partial<Category>) => void
  deleteCategory: (id: string) => void

  // Budgets
  addBudget: (b: Omit<Budget, 'id'>) => void
  updateBudget: (id: string, b: Partial<Budget>) => void
  deleteBudget: (id: string) => void

  // Savings
  addSavingsGoal: (g: Omit<SavingsGoal, 'id'>) => void
  updateSavingsGoal: (id: string, g: Partial<SavingsGoal>) => void
  deleteSavingsGoal: (id: string) => void

  // Settings
  updateSettings: (s: Partial<AppSettings>) => void
  resetAllData: () => void
}

// ─── Apply theme to DOM ───────────────────────────────────────
function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    prefersDark ? root.classList.remove('light') : root.classList.add('light')
  } else if (theme === 'light') {
    root.classList.add('light')
  } else {
    root.classList.remove('light')
  }
}

// ─── Store ────────────────────────────────────────────────────
export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      transactions: DEFAULT_TRANSACTIONS,
      categories: DEFAULT_CATEGORIES,
      budgets: [],
      savingsGoals: [],
      settings: DEFAULT_SETTINGS,

      // Transactions
      addTransaction: (t) => set(s => ({ transactions: [{ ...t, id: uid() }, ...s.transactions] })),
      updateTransaction: (id, t) => set(s => ({
        transactions: s.transactions.map(tx => tx.id === id ? { ...tx, ...t } : tx)
      })),
      deleteTransaction: (id) => set(s => ({ transactions: s.transactions.filter(t => t.id !== id) })),

      // Categories
      addCategory: (c) => set(s => ({ categories: [...s.categories, { ...c, id: uid() }] })),
      updateCategory: (id, c) => set(s => ({
        categories: s.categories.map(cat => cat.id === id ? { ...cat, ...c } : cat)
      })),
      deleteCategory: (id) => set(s => ({ categories: s.categories.filter(c => c.id !== id) })),

      // Budgets
      addBudget: (b) => set(s => ({ budgets: [...s.budgets, { ...b, id: uid() }] })),
      updateBudget: (id, b) => set(s => ({
        budgets: s.budgets.map(bud => bud.id === id ? { ...bud, ...b } : bud)
      })),
      deleteBudget: (id) => set(s => ({ budgets: s.budgets.filter(b => b.id !== id) })),

      // Savings
      addSavingsGoal: (g) => set(s => ({ savingsGoals: [...s.savingsGoals, { ...g, id: uid() }] })),
      updateSavingsGoal: (id, g) => set(s => ({
        savingsGoals: s.savingsGoals.map(goal => goal.id === id ? { ...goal, ...g } : goal)
      })),
      deleteSavingsGoal: (id) => set(s => ({ savingsGoals: s.savingsGoals.filter(g => g.id !== id) })),

      // Settings
      updateSettings: (s) => set(store => {
        const next = { ...store.settings, ...s }
        if (s.theme) applyTheme(s.theme)
        return { settings: next }
      }),

      // Reset
      resetAllData: () => set({
        transactions: DEFAULT_TRANSACTIONS,
        categories: DEFAULT_CATEGORIES,
        budgets: [],
        savingsGoals: [],
        settings: DEFAULT_SETTINGS,
      }),
    }),
    {
      name: 'moneyflow-data',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.settings?.theme) {
          applyTheme(state.settings.theme)
        }
      },
    }
  )
)

// ─── Initialize theme on first load ──────────────────────────
export function initTheme() {
  try {
    const stored = localStorage.getItem('moneyflow-data')
    if (stored) {
      const data = JSON.parse(stored)
      const theme = data?.state?.settings?.theme as Theme | undefined
      if (theme) {
        applyTheme(theme)
        return
      }
    }
  } catch (_) { /* ignore */ }
  // Default: dark
  document.documentElement.classList.remove('light')
}
