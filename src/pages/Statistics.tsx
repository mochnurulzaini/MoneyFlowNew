import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '../store'
import { CategoryIcon } from '../components/ui/CategoryIcon'
import {
  formatCurrency, formatCurrencyFull, formatMonth,
  getMonthlyStats, getCategoryTotals, getMonthlyHistory, addMonths
} from '../utils'

export default function Statistics() {
  const { transactions, categories, settings } = useAppStore()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [activeTab, setActiveTab] = useState<'overview' | 'income' | 'expense'>('overview')

  const stats = getMonthlyStats(transactions, currentMonth)
  const history = getMonthlyHistory(transactions, 6)
  const maxVal = Math.max(...history.map(h => Math.max(h.income, h.expense)), 1)

  const expenseCats = getCategoryTotals(transactions, categories, currentMonth, 'expense')
  const incomeCats = getCategoryTotals(transactions, categories, currentMonth, 'income')
  const cats = activeTab === 'income' ? incomeCats : expenseCats
  const totalCat = cats.reduce((s, c) => s + c.amount, 0)

  // Donut chart segments
  const donutR = 54
  const donutCirc = 2 * Math.PI * donutR
  let accumulated = 0
  const segments = cats.slice(0, 6).map(({ category, amount, percent }) => {
    const offset = donutCirc - (accumulated / totalCat) * donutCirc
    const dash = (amount / totalCat) * donutCirc
    accumulated += amount
    return { category, amount, percent, offset, dash }
  })

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Statistik</h1>
        <p className="page-subtitle">Analisis keuangan bulanan</p>
      </div>

      {/* Month selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}>‹</button>
        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)' }}>{formatMonth(currentMonth)}</span>
        <button className="btn btn-ghost btn-sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>›</button>
      </div>

      {/* Summary Cards */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--income)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Pemasukan</div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1rem', color: 'var(--income)' }}>{formatCurrency(stats.income, settings.currency)}</div>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--expense)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Pengeluaran</div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1rem', color: 'var(--expense)' }}>{formatCurrency(stats.expense, settings.currency)}</div>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Selisih</div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1rem', color: stats.income >= stats.expense ? 'var(--income)' : 'var(--expense)' }}>
            {formatCurrency(stats.income - stats.expense, settings.currency)}
          </div>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Transaksi</div>
          <div style={{ fontFamily: 'Syne, system-ui', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text)' }}>{stats.count}</div>
        </div>
      </motion.div>

      {/* 6-Month Bar Chart */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="card" style={{ padding: '1.125rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-2)', marginBottom: '1rem' }}>6 Bulan Terakhir</div>

        {/* Chart */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100, marginBottom: '0.5rem' }}>
          {history.map((h, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, height: '100%' }}>
              <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 2 }}>
                <div style={{
                  height: `${maxVal > 0 ? (h.income / maxVal) * 100 : 0}%`,
                  minHeight: h.income > 0 ? 4 : 0,
                  background: 'var(--income)', borderRadius: '3px 3px 0 0',
                  transition: 'height 0.5s ease',
                  opacity: 0.85,
                }} />
              </div>
              <div style={{ height: `${maxVal > 0 ? (h.expense / maxVal) * 100 : 0}%`, width: '100%', minHeight: h.expense > 0 ? 4 : 0, background: 'var(--expense)', borderRadius: '3px 3px 0 0', transition: 'height 0.5s ease', opacity: 0.85 }} />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {history.map((h, i) => (
            <div key={i} style={{ flex: 1, fontSize: '0.6rem', color: 'var(--text-3)', textAlign: 'center', fontWeight: 600 }}>
              {h.label}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem' }}>
          {[{ color: 'var(--income)', label: 'Pemasukan' }, { color: 'var(--expense)', label: 'Pengeluaran' }].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 500 }}>{l.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Category Breakdown */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="card" style={{ padding: '1.125rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-2)', marginBottom: '0.875rem' }}>Breakdown Kategori</div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--surface)', borderRadius: 8, padding: 3, marginBottom: '1rem', border: '1px solid var(--border)' }}>
          {(['expense', 'income'] as const).map(t => (
            <button key={t} className={`tab-btn${activeTab === t ? ' active' : ''}`} onClick={() => setActiveTab(t)} style={{ flex: 1 }}>
              {t === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
            </button>
          ))}
        </div>

        {cats.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-3)', fontSize: '0.875rem' }}>
            Tidak ada data bulan ini
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {/* Donut */}
            <div style={{ flexShrink: 0 }}>
              <svg width="128" height="128" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r={donutR} fill="none" stroke="var(--border)" strokeWidth="12" />
                {segments.map(({ category, dash, offset }, i) => (
                  <circle
                    key={i}
                    cx="64" cy="64" r={donutR}
                    fill="none"
                    stroke={category.color}
                    strokeWidth="12"
                    strokeLinecap="butt"
                    strokeDasharray={`${dash} ${donutCirc}`}
                    strokeDashoffset={offset}
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '64px 64px', transition: 'stroke-dasharray 0.6s ease' }}
                  />
                ))}
                <text x="64" y="60" textAnchor="middle" fill="var(--text)" fontSize="11" fontWeight="700" fontFamily="JetBrains Mono, monospace">
                  {formatCurrency(totalCat, settings.currency)}
                </text>
                <text x="64" y="76" textAnchor="middle" fill="var(--text-3)" fontSize="8" fontFamily="Plus Jakarta Sans, system-ui">
                  {activeTab === 'expense' ? 'pengeluaran' : 'pemasukan'}
                </text>
              </svg>
            </div>

            {/* Legend */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {cats.slice(0, 6).map(({ category, amount, percent }) => (
                <div key={category.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: category.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{category.name}</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', flexShrink: 0 }}>{Math.round(percent)}%</span>
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', fontFamily: 'JetBrains Mono, monospace' }}>{formatCurrencyFull(amount, settings.currency)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
