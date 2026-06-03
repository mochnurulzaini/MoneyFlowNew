import { useState, useMemo } from 'react'
import { Search, Filter, Trash2, Edit2, Plus, ArrowLeftRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../store'
import { CategoryIcon } from '../components/ui/CategoryIcon'
import Modal from '../components/ui/Modal'
import TransactionForm from './TransactionForm'
import type { Transaction } from '../types'
import {
  formatCurrencyFull, formatDateShort, formatMonth,
  groupByDate, isSameMonth, addMonths
} from '../utils'

export default function Transactions() {
  const { transactions, categories, deleteTransaction, settings } = useAppStore()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [editTx, setEditTx] = useState<Transaction | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (!isSameMonth(t.date, currentMonth)) return false
      if (filter !== 'all' && t.type !== filter) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        const cat = categories.find(c => c.id === t.categoryId)
        if (!t.description.toLowerCase().includes(q) &&
            !cat?.name.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [transactions, categories, currentMonth, filter, search])

  const grouped = groupByDate(filtered)
  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Transaksi</h1>
        <p className="page-subtitle">{formatMonth(currentMonth)}</p>
      </div>

      {/* Month Selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', gap: '0.5rem' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}>‹</button>
        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)', flex: 1, textAlign: 'center' }}>
          {formatMonth(currentMonth)}
        </span>
        <button className="btn btn-ghost btn-sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>›</button>
      </div>

      {/* Summary Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
        {[
          { label: 'Masuk', val: totalIncome, color: 'var(--income)' },
          { label: 'Keluar', val: totalExpense, color: 'var(--expense)' },
          { label: 'Selisih', val: totalIncome - totalExpense, color: totalIncome >= totalExpense ? 'var(--income)' : 'var(--expense)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', fontWeight: 600, marginBottom: 3 }}>{s.label}</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: s.color, fontFamily: 'JetBrains Mono, monospace' }}>
              {formatCurrencyFull(s.val, settings.currency).replace('Rp ', 'Rp')}
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input
            className="form-input"
            placeholder="Cari transaksi..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 32 }}
          />
        </div>
        <button className="btn btn-ghost btn-sm" style={{ flexShrink: 0, gap: 4, paddingLeft: 10, paddingRight: 10 }}>
          <Filter size={15} />
        </button>
      </div>

      {/* Type tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.25rem', background: 'var(--card)', borderRadius: 10, padding: 4, border: '1px solid var(--border)' }}>
        {(['all', 'income', 'expense'] as const).map(f => (
          <button key={f} className={`tab-btn${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)} style={{ flex: 1 }}>
            {f === 'all' ? 'Semua' : f === 'income' ? 'Masuk' : 'Keluar'}
          </button>
        ))}
      </div>

      {/* Add button (desktop) */}
      <div style={{ display: 'none' }}>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)} style={{ display: 'flex' }}>
          <Plus size={15} /> Tambah
        </button>
      </div>

      {/* Transaction list grouped by date */}
      {grouped.size === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon"><ArrowLeftRight size={24} /></div>
          <p style={{ color: 'var(--text-3)', fontSize: '0.875rem', margin: 0, fontWeight: 500 }}>
            {search ? 'Tidak ada hasil' : 'Belum ada transaksi bulan ini'}
          </p>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
            <Plus size={14} /> Tambah Transaksi
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {Array.from(grouped.entries()).map(([dateKey, txs]) => (
            <div key={dateKey}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                {formatDateShort(new Date(dateKey))}
              </div>
              <div className="card" style={{ overflow: 'hidden' }}>
                <AnimatePresence>
                  {txs.map((tx, i) => {
                    const cat = categories.find(c => c.id === tx.categoryId)
                    return (
                      <motion.div
                        key={tx.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.75rem',
                          padding: '0.875rem',
                          borderBottom: i < txs.length - 1 ? '1px solid var(--border)' : 'none',
                        }}
                      >
                        <CategoryIcon name={cat?.icon || 'Tag'} size={16} bgColor={cat?.color || '#94a3b8'} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {tx.description}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: 1 }}>{cat?.name}</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.875rem', color: tx.type === 'income' ? 'var(--income)' : 'var(--expense)' }}>
                            {tx.type === 'income' ? '+' : '-'}{formatCurrencyFull(tx.amount, settings.currency)}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                          <button className="btn btn-icon" onClick={() => setEditTx(tx)} style={{ width: 30, height: 30 }} aria-label="Edit">
                            <Edit2 size={13} />
                          </button>
                          <button className="btn btn-icon" onClick={() => setConfirmDelete(tx.id)} style={{ width: 30, height: 30, color: 'var(--expense)' }} aria-label="Hapus">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Modal open={!!editTx} onClose={() => setEditTx(null)} title="Edit Transaksi">
        {editTx && (
          <TransactionForm
            initial={editTx}
            onSuccess={() => setEditTx(null)}
            onCancel={() => setEditTx(null)}
          />
        )}
      </Modal>

      {/* Add Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Tambah Transaksi">
        <TransactionForm onSuccess={() => setShowAdd(false)} onCancel={() => setShowAdd(false)} />
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Hapus Transaksi">
        <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', marginTop: 0 }}>
          Yakin ingin menghapus transaksi ini? Tindakan ini tidak bisa dibatalkan.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setConfirmDelete(null)}>Batal</button>
          <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => { deleteTransaction(confirmDelete!); setConfirmDelete(null) }}>Hapus</button>
        </div>
      </Modal>
    </div>
  )
}
