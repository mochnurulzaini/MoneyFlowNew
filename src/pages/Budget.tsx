import { useState } from 'react'
import { Plus, Edit2, Trash2, PieChart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../store'
import { CategoryIcon } from '../components/ui/CategoryIcon'
import Modal from '../components/ui/Modal'
import type { Budget } from '../types'
import { formatCurrencyFull, formatCurrency, getBudgetProgress } from '../utils'

interface FormState { categoryId: string; amount: string; period: 'monthly' | 'weekly' }
const EMPTY: FormState = { categoryId: '', amount: '', period: 'monthly' }

export default function Budget() {
  const { budgets, categories, transactions, addBudget, updateBudget, deleteBudget, settings } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Budget | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [confirmDel, setConfirmDel] = useState<string | null>(null)
  const [error, setError] = useState('')

  const expenseCategories = categories.filter(c => c.type === 'expense' || c.type === 'both')

  const openAdd = () => { setForm(EMPTY); setEditing(null); setError(''); setShowForm(true) }
  const openEdit = (b: Budget) => {
    setForm({ categoryId: b.categoryId, amount: b.amount.toString(), period: b.period })
    setEditing(b); setError(''); setShowForm(true)
  }

  const handleSave = () => {
    if (!form.categoryId) { setError('Pilih kategori'); return }
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) { setError('Masukkan anggaran yang valid'); return }
    const payload = { categoryId: form.categoryId, amount: Number(form.amount), period: form.period }
    if (editing) updateBudget(editing.id, payload)
    else addBudget(payload)
    setShowForm(false)
  }

  // Compute budgets with spent
  const budgetsWithProgress = budgets.map(b => ({
    ...b,
    spent: getBudgetProgress(b, transactions),
    category: categories.find(c => c.id === b.categoryId),
  }))

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0)
  const totalSpent = budgetsWithProgress.reduce((s, b) => s + b.spent, 0)
  const overBudget = budgetsWithProgress.filter(b => b.spent > b.amount).length

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Anggaran</h1>
          <p className="page-subtitle">{budgets.length} anggaran aktif</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openAdd} style={{ marginTop: 4 }}>
          <Plus size={15} /> Tambah
        </button>
      </div>

      {/* Overview */}
      {budgets.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', textAlign: 'center' }}>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>{formatCurrency(totalBudget, settings.currency)}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', marginTop: 2, fontWeight: 500 }}>Total Anggaran</div>
            </div>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1rem', color: 'var(--expense)' }}>{formatCurrency(totalSpent, settings.currency)}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', marginTop: 2, fontWeight: 500 }}>Total Terpakai</div>
            </div>
            <div>
              <div style={{ fontFamily: 'Syne, system-ui', fontWeight: 800, fontSize: '1.25rem', color: overBudget > 0 ? 'var(--expense)' : 'var(--income)' }}>{overBudget}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', marginTop: 2, fontWeight: 500 }}>Lewat Batas</div>
            </div>
          </div>

          {totalBudget > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: 6, fontWeight: 500 }}>
                <span>Total penggunaan</span>
                <span style={{ color: totalSpent > totalBudget ? 'var(--expense)' : 'var(--text-2)', fontWeight: 700 }}>
                  {Math.round((totalSpent / totalBudget) * 100)}%
                </span>
              </div>
              <div className="progress-bar" style={{ height: 8 }}>
                <div className="progress-fill" style={{
                  width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%`,
                  background: totalSpent > totalBudget ? 'var(--expense)' : 'var(--accent)',
                }} />
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Budget list */}
      {budgetsWithProgress.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon"><PieChart size={24} /></div>
          <p style={{ color: 'var(--text-3)', fontSize: '0.875rem', margin: 0, fontWeight: 500 }}>Belum ada anggaran</p>
          <p style={{ color: 'var(--text-3)', fontSize: '0.8rem', margin: 0 }}>Buat anggaran untuk memantau pengeluaran</p>
          <button className="btn btn-primary btn-sm" onClick={openAdd}><Plus size={14} /> Buat Anggaran</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <AnimatePresence>
            {budgetsWithProgress.map((b, i) => {
              if (!b.category) return null
              const pct = Math.min((b.spent / b.amount) * 100, 100)
              const over = b.spent > b.amount
              const remaining = b.amount - b.spent

              return (
                <motion.div
                  key={b.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04 }}
                  className="card"
                  style={{ padding: '1rem' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.875rem' }}>
                    <CategoryIcon name={b.category.icon} size={17} bgColor={b.category.color} />
                    <div style={{ flex: 1, marginLeft: '0.75rem' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)' }}>{b.category.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: 1, fontWeight: 500 }}>
                        {b.period === 'monthly' ? 'Per Bulan' : 'Per Minggu'}
                      </div>
                    </div>
                    {over && (
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, background: 'var(--expense-dim)', color: 'var(--expense)', padding: '0.2rem 0.5rem', borderRadius: 99 }}>
                        Melebihi!
                      </span>
                    )}
                    <div style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
                      <button className="btn btn-icon" onClick={() => openEdit(b)} style={{ width: 28, height: 28 }}><Edit2 size={12} /></button>
                      <button className="btn btn-icon" onClick={() => setConfirmDel(b.id)} style={{ width: 28, height: 28, color: 'var(--expense)' }}><Trash2 size={12} /></button>
                    </div>
                  </div>

                  <div className="progress-bar" style={{ marginBottom: '0.625rem' }}>
                    <div className="progress-fill" style={{
                      width: `${pct}%`,
                      background: over ? 'var(--expense)' : pct > 75 ? 'var(--warning)' : b.category.color,
                    }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
                    <span style={{ color: over ? 'var(--expense)' : 'var(--text-2)' }}>
                      {formatCurrency(b.spent, settings.currency)} terpakai
                    </span>
                    <span style={{ color: over ? 'var(--expense)' : 'var(--text-3)' }}>
                      {over ? `+${formatCurrency(Math.abs(remaining), settings.currency)} lebih` : `${formatCurrency(remaining, settings.currency)} sisa`}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.7rem', color: 'var(--text-3)', marginTop: 2, fontWeight: 500 }}>
                    dari {formatCurrencyFull(b.amount, settings.currency)} ({Math.round(pct)}%)
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Form Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Anggaran' : 'Buat Anggaran'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Kategori</label>
            <select className="form-input" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
              <option value="">Pilih kategori...</option>
              {expenseCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Batas Anggaran (Rp)</label>
            <input className="form-input" type="number" placeholder="0" min="0" inputMode="numeric" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }} />
            {form.amount && <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 4 }}>Rp {Number(form.amount).toLocaleString('id-ID')}</div>}
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Periode</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['monthly', 'weekly'] as const).map(p => (
                <button key={p} className="btn btn-sm" onClick={() => setForm(f => ({ ...f, period: p }))}
                  style={{ flex: 1, background: form.period === p ? 'var(--accent)' : 'var(--card)', color: form.period === p ? '#000' : 'var(--text-3)', border: '1px solid var(--border)' }}>
                  {p === 'monthly' ? 'Bulanan' : 'Mingguan'}
                </button>
              ))}
            </div>
          </div>
          {error && <div style={{ color: 'var(--expense)', fontSize: '0.8rem', fontWeight: 500 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Batal</button>
            <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleSave}>{editing ? 'Simpan' : 'Buat'}</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)} title="Hapus Anggaran?">
        <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', marginTop: 0 }}>Anggaran ini akan dihapus permanen.</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setConfirmDel(null)}>Batal</button>
          <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => { deleteBudget(confirmDel!); setConfirmDel(null) }}>Hapus</button>
        </div>
      </Modal>
    </div>
  )
}
