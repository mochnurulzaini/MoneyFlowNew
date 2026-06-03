import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, TrendingDown, ArrowRight, Plus, Wallet } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppStore } from '../store'
import { CategoryIcon } from '../components/ui/CategoryIcon'
import Modal from '../components/ui/Modal'
import TransactionForm from './TransactionForm'
import {
  formatCurrency, formatCurrencyFull, formatDateShort,
  getMonthlyStats, getBudgetProgress, isSameMonth
} from '../utils'

export default function Dashboard() {
  const { transactions, categories, budgets, settings } = useAppStore()
  const [showAdd, setShowAdd] = useState(false)

  const now = new Date()
  const { income, expense, balance } = getMonthlyStats(transactions, now)
  const totalBalance = transactions.reduce((s, t) => t.type === 'income' ? s + t.amount : s - t.amount, 0)

  const recent = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  const thisMonthTx = transactions.filter(t => isSameMonth(t.date, now))
  const activeBudgets = budgets.slice(0, 3).map(b => ({
    ...b,
    spent: getBudgetProgress(b, transactions),
    category: categories.find(c => c.id === b.categoryId),
  }))

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <p className="page-title">
          Halo! 👋
        </p>
        <p className="page-subtitle">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="balance-card"
        style={{ padding: '1.5rem', marginBottom: '1rem' }}
      >
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
          Total Saldo
        </div>
        <div style={{
          fontFamily: 'Syne, system-ui', fontWeight: 800,
          fontSize: 'clamp(1.75rem, 6vw, 2.25rem)',
          color: 'var(--text)', lineHeight: 1.1, marginBottom: '1.25rem'
        }}>
          {formatCurrencyFull(totalBalance, settings.currency)}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(0,229,154,0.08)', borderRadius: 10, padding: '0.75rem', border: '1px solid rgba(0,229,154,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <TrendingUp size={14} color="var(--income)" />
              <span style={{ fontSize: '0.7rem', color: 'var(--income)', fontWeight: 600 }}>Pemasukan</span>
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, fontSize: '0.95rem', color: 'var(--income)' }}>
              {formatCurrency(income, settings.currency)}
            </div>
          </div>
          <div style={{ background: 'rgba(255,77,114,0.08)', borderRadius: 10, padding: '0.75rem', border: '1px solid rgba(255,77,114,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <TrendingDown size={14} color="var(--expense)" />
              <span style={{ fontSize: '0.7rem', color: 'var(--expense)', fontWeight: 600 }}>Pengeluaran</span>
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, fontSize: '0.95rem', color: 'var(--expense)' }}>
              {formatCurrency(expense, settings.currency)}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Add */}
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="btn btn-primary"
        onClick={() => setShowAdd(true)}
        style={{ width: '100%', marginBottom: '1.5rem', padding: '0.75rem', gap: 8, borderRadius: 12 }}
      >
        <Plus size={18} />
        Tambah Transaksi
      </motion.button>

      {/* Budget Summary */}
      {activeBudgets.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <p className="section-title">Anggaran Bulan Ini</p>
            <Link to="/budget" style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
              Lihat semua <ArrowRight size={12} />
            </Link>
          </div>
          <div className="card" style={{ padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {activeBudgets.map(b => {
              if (!b.category) return null
              const pct = Math.min((b.spent / b.amount) * 100, 100)
              const over = b.spent > b.amount
              return (
                <div key={b.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CategoryIcon name={b.category.icon} size={14} color={b.category.color} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)' }}>{b.category.name}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: over ? 'var(--expense)' : 'var(--text-3)', fontFamily: 'JetBrains Mono, monospace' }}>
                      {formatCurrency(b.spent)} / {formatCurrency(b.amount)}
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${pct}%`, background: over ? 'var(--expense)' : b.category.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Recent Transactions */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <p className="section-title">Transaksi Terbaru</p>
          <Link to="/transactions" style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
            Lihat semua <ArrowRight size={12} />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="card empty-state" style={{ padding: '2rem' }}>
            <div className="empty-state-icon">
              <Wallet size={24} />
            </div>
            <p style={{ color: 'var(--text-3)', fontSize: '0.875rem', margin: 0 }}>Belum ada transaksi</p>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
              Tambah sekarang
            </button>
          </div>
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            {recent.map((tx, i) => {
              const cat = categories.find(c => c.id === tx.categoryId)
              return (
                <div key={tx.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.875rem',
                  padding: '0.875rem',
                  borderBottom: i < recent.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <CategoryIcon name={cat?.icon || 'Tag'} size={16} bgColor={cat?.color || '#94a3b8'} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {tx.description}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: 1 }}>
                      {cat?.name} · {formatDateShort(tx.date)}
                    </div>
                  </div>
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.875rem',
                    color: tx.type === 'income' ? 'var(--income)' : 'var(--expense)',
                    flexShrink: 0,
                  }}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, settings.currency)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Stat cards at bottom */}
      {thisMonthTx.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1.5rem' }}
        >
          <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Syne, system-ui', color: 'var(--text)' }}>{thisMonthTx.length}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: 2, fontWeight: 500 }}>Transaksi bulan ini</div>
          </div>
          <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Syne, system-ui', color: income >= expense ? 'var(--income)' : 'var(--expense)' }}>
              {formatCurrency(income - expense, settings.currency)}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: 2, fontWeight: 500 }}>Selisih bulan ini</div>
          </div>
        </motion.div>
      )}

      {/* Add Transaction Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Tambah Transaksi">
        <TransactionForm onSuccess={() => setShowAdd(false)} onCancel={() => setShowAdd(false)} />
      </Modal>
    </div>
  )
}
