import type { Transaction, Category, Budget } from '../types'

// ─── Currency ────────────────────────────────────────────────
export function formatCurrency(amount: number, currency = 'IDR'): string {
  if (currency === 'IDR') {
    if (Math.abs(amount) >= 1_000_000) {
      return `Rp ${(amount / 1_000_000).toFixed(1)}jt`
    }
    if (Math.abs(amount) >= 1_000) {
      return `Rp ${(amount / 1_000).toFixed(0)}rb`
    }
    return `Rp ${amount.toLocaleString('id-ID')}`
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatCurrencyFull(amount: number, currency = 'IDR'): string {
  if (currency === 'IDR') {
    return `Rp ${amount.toLocaleString('id-ID')}`
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// ─── Dates ───────────────────────────────────────────────────
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

export function formatMonth(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

export function isSameMonth(a: string | Date, b: string | Date): boolean {
  const da = typeof a === 'string' ? new Date(a) : a
  const db = typeof b === 'string' ? new Date(b) : b
  return da.getMonth() === db.getMonth() && da.getFullYear() === db.getFullYear()
}

export function isSameDay(a: string | Date, b: string | Date): boolean {
  const da = typeof a === 'string' ? new Date(a) : a
  const db = typeof b === 'string' ? new Date(b) : b
  return da.getDate() === db.getDate() &&
         da.getMonth() === db.getMonth() &&
         da.getFullYear() === db.getFullYear()
}

export function getMonthStart(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function getMonthEnd(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

export function addMonths(date: Date, n: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + n, 1)
}

// ─── Stats helpers ────────────────────────────────────────────
export function getMonthlyStats(transactions: Transaction[], month: Date) {
  const inRange = transactions.filter(t => isSameMonth(t.date, month))
  const income = inRange.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = inRange.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  return { income, expense, balance: income - expense, count: inRange.length }
}

export function getCategorySpend(transactions: Transaction[], categoryId: string, month?: Date): number {
  const filtered = transactions.filter(t => {
    if (t.categoryId !== categoryId) return false
    if (month) return isSameMonth(t.date, month)
    return true
  })
  return filtered.reduce((s, t) => s + t.amount, 0)
}

export function getBudgetProgress(budget: Budget, transactions: Transaction[]): number {
  const now = new Date()
  const start = budget.period === 'monthly' ? getMonthStart(now) : getWeekStart(now)
  const end = budget.period === 'monthly' ? getMonthEnd(now) : getWeekEnd(now)
  const spent = transactions.filter(t => {
    const d = new Date(t.date)
    return t.categoryId === budget.categoryId &&
           t.type === 'expense' &&
           d >= start && d <= end
  }).reduce((s, t) => s + t.amount, 0)
  return spent
}

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

function getWeekEnd(date: Date): Date {
  const d = getWeekStart(date)
  d.setDate(d.getDate() + 6)
  d.setHours(23, 59, 59, 999)
  return d
}

// ─── Group transactions by date ───────────────────────────────
export function groupByDate(transactions: Transaction[]): Map<string, Transaction[]> {
  const map = new Map<string, Transaction[]>()
  const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  for (const t of sorted) {
    const key = new Date(t.date).toDateString()
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(t)
  }
  return map
}

// ─── Unique ID ────────────────────────────────────────────────
export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

// ─── Category total per month ─────────────────────────────────
export function getCategoryTotals(
  transactions: Transaction[],
  categories: Category[],
  month: Date,
  type: 'income' | 'expense'
): Array<{ category: Category; amount: number; percent: number }> {
  const inMonth = transactions.filter(t => t.type === type && isSameMonth(t.date, month))
  const total = inMonth.reduce((s, t) => s + t.amount, 0)
  const result = categories
    .filter(c => c.type === type || c.type === 'both')
    .map(cat => {
      const amount = inMonth.filter(t => t.categoryId === cat.id).reduce((s, t) => s + t.amount, 0)
      return { category: cat, amount, percent: total > 0 ? (amount / total) * 100 : 0 }
    })
    .filter(r => r.amount > 0)
    .sort((a, b) => b.amount - a.amount)
  return result
}

// ─── 6-month history ──────────────────────────────────────────
export function getMonthlyHistory(transactions: Transaction[], months = 6) {
  const result = []
  const now = new Date()
  for (let i = months - 1; i >= 0; i--) {
    const month = addMonths(now, -i)
    const stats = getMonthlyStats(transactions, month)
    result.push({
      label: month.toLocaleDateString('id-ID', { month: 'short' }),
      ...stats,
    })
  }
  return result
}
