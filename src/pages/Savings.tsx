import { useState } from 'react'
import { Plus, Edit2, Trash2, PiggyBank, Target } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../store'
import { CategoryIcon, ICON_OPTIONS, COLOR_OPTIONS } from '../components/ui/CategoryIcon'
import Modal from '../components/ui/Modal'
import type { SavingsGoal } from '../types'
import { formatCurrencyFull, formatDate } from '../utils'

interface GoalForm { name: string; targetAmount: string; currentAmount: string; deadline: string; icon: string; color: string }
const EMPTY: GoalForm = { name: '', targetAmount: '', currentAmount: '0', deadline: '', icon: 'PiggyBank', color: '#00e5c3' }

export default function Savings() {
  const { savingsGoals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal, settings } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<SavingsGoal | null>(null)
  const [form, setForm] = useState<GoalForm>(EMPTY)
  const [confirmDel, setConfirmDel] = useState<string | null>(null)
  const [addFunds, setAddFunds] = useState<{ goal: SavingsGoal; amount: string } | null>(null)
  const [error, setError] = useState('')

  const openAdd = () => { setForm(EMPTY); setEditing(null); setError(''); setShowForm(true) }
  const openEdit = (g: SavingsGoal) => {
    setForm({
      name: g.name, targetAmount: g.targetAmount.toString(),
      currentAmount: g.currentAmount.toString(),
      deadline: g.deadline ? g.deadline.split('T')[0] : '',
      icon: g.icon, color: g.color,
    })
    setEditing(g); setError(''); setShowForm(true)
  }

  const handleSave = () => {
    if (!form.name.trim()) { setError('Nama tujuan wajib diisi'); return }
    if (!form.targetAmount || Number(form.targetAmount) <= 0) { setError('Masukkan target yang valid'); return }
    const payload = {
      name: form.name.trim(),
      targetAmount: Number(form.targetAmount),
      currentAmount: Number(form.currentAmount) || 0,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
      icon: form.icon,
      color: form.color,
    }
    if (editing) updateSavingsGoal(editing.id, payload)
    else addSavingsGoal(payload)
    setShowForm(false)
  }

  const handleAddFunds = () => {
    if (!addFunds) return
    const amt = Number(addFunds.amount)
    if (!amt || amt <= 0) return
    updateSavingsGoal(addFunds.goal.id, {
      currentAmount: Math.min(addFunds.goal.currentAmount + amt, addFunds.goal.targetAmount)
    })
    setAddFunds(null)
  }

  const totalTarget = savingsGoals.reduce((s, g) => s + g.targetAmount, 0)
  const totalSaved = savingsGoals.reduce((s, g) => s + g.currentAmount, 0)

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Tabungan</h1>
          <p className="page-subtitle">{savingsGoals.length} tujuan tabungan</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openAdd} style={{ marginTop: 4 }}>
          <Plus size={15} /> Tambah
        </button>
      </div>

      {/* Overview */}
      {savingsGoals.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.95rem', color: 'var(--income)' }}>{formatCurrencyFull(totalSaved, settings.currency)}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', marginTop: 3, fontWeight: 500 }}>Total Ditabung</div>
          </div>
          <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>{formatCurrencyFull(totalTarget, settings.currency)}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', marginTop: 3, fontWeight: 500 }}>Total Target</div>
          </div>
        </motion.div>
      )}

      {/* Goals */}
      {savingsGoals.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon"><PiggyBank size={24} /></div>
          <p style={{ color: 'var(--text-3)', fontSize: '0.875rem', margin: 0, fontWeight: 500 }}>Belum ada tujuan tabungan</p>
          <p style={{ color: 'var(--text-3)', fontSize: '0.8rem', margin: 0 }}>Buat tujuan untuk mencapai impianmu</p>
          <button className="btn btn-primary btn-sm" onClick={openAdd}><Plus size={14} /> Buat Tujuan</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <AnimatePresence>
            {savingsGoals.map((g, i) => {
              const pct = Math.min((g.currentAmount / g.targetAmount) * 100, 100)
              const done = g.currentAmount >= g.targetAmount
              const R = 28, circ = 2 * Math.PI * R
              const strokeDash = (pct / 100) * circ

              return (
                <motion.div
                  key={g.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04 }}
                  className="card"
                  style={{ padding: '1.125rem' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {/* Circle Progress */}
                    <div style={{ position: 'relative', width: 68, height: 68, flexShrink: 0 }}>
                      <svg width="68" height="68" className="circular-progress">
                        <circle cx="34" cy="34" r={R} fill="none" stroke="var(--border)" strokeWidth="5" />
                        <circle cx="34" cy="34" r={R} fill="none" stroke={done ? 'var(--income)' : g.color}
                          strokeWidth="5" strokeLinecap="round"
                          strokeDasharray={circ} strokeDashoffset={circ - strokeDash}
                          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                        />
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: g.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', color: g.color }}>
                          <CategoryIcon name={g.icon} size={14} />
                        </div>
                      </div>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {g.name}
                        </div>
                        {done && <span style={{ fontSize: '0.65rem', fontWeight: 700, background: 'var(--income-dim)', color: 'var(--income)', padding: '0.15rem 0.5rem', borderRadius: 99, flexShrink: 0 }}>✓ Selesai</span>}
                      </div>

                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', fontWeight: 700, color: g.color, marginTop: 2 }}>
                        {formatCurrencyFull(g.currentAmount, settings.currency)}
                        <span style={{ color: 'var(--text-3)', fontWeight: 400 }}> / {formatCurrencyFull(g.targetAmount, settings.currency)}</span>
                      </div>

                      {g.deadline && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Target size={10} /> {formatDate(g.deadline)}
                        </div>
                      )}

                      <div className="progress-bar" style={{ marginTop: '0.5rem' }}>
                        <div className="progress-fill" style={{ width: `${pct}%`, background: done ? 'var(--income)' : g.color }} />
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', marginTop: 3, fontWeight: 500 }}>{Math.round(pct)}% tercapai</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 6, marginTop: '0.875rem' }}>
                    {!done && (
                      <button className="btn btn-sm" onClick={() => setAddFunds({ goal: g, amount: '' })}
                        style={{ flex: 1, background: g.color + '22', color: g.color, border: `1px solid ${g.color}44`, fontWeight: 600 }}>
                        + Tambah Dana
                      </button>
                    )}
                    <button className="btn btn-icon btn-sm" onClick={() => openEdit(g)} style={{ width: 34, height: 34 }}><Edit2 size={13} /></button>
                    <button className="btn btn-icon btn-sm" onClick={() => setConfirmDel(g.id)} style={{ width: 34, height: 34, color: 'var(--expense)' }}><Trash2 size={13} /></button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Tujuan' : 'Tujuan Baru'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Nama Tujuan</label>
            <input className="form-input" placeholder="Contoh: Beli Laptop Baru" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Target (Rp)</label>
            <input className="form-input" type="number" placeholder="0" min="0" inputMode="numeric" value={form.targetAmount} onChange={e => setForm(f => ({ ...f, targetAmount: e.target.value }))} style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Sudah Ditabung (Rp)</label>
            <input className="form-input" type="number" placeholder="0" min="0" inputMode="numeric" value={form.currentAmount} onChange={e => setForm(f => ({ ...f, currentAmount: e.target.value }))} style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Deadline (opsional)</label>
            <input className="form-input" type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 8 }}>Warna</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {COLOR_OPTIONS.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={`color-dot${form.color === c ? ' selected' : ''}`}
                  style={{ background: c, border: `3px solid ${form.color === c ? 'var(--text)' : 'transparent'}` }} />
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 8 }}>Ikon</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ICON_OPTIONS.slice(0, 16).map(name => (
                <button key={name} onClick={() => setForm(f => ({ ...f, icon: name }))}
                  style={{ width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: form.icon === name ? form.color + '33' : 'var(--card)', color: form.icon === name ? form.color : 'var(--text-3)', outline: form.icon === name ? `2px solid ${form.color}` : 'none', transition: 'all 0.15s' }}>
                  <CategoryIcon name={name} size={16} />
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

      {/* Add Funds Modal */}
      <Modal open={!!addFunds} onClose={() => setAddFunds(null)} title="Tambah Dana">
        {addFunds && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', margin: 0 }}>
              Tambah dana ke <strong style={{ color: 'var(--text)' }}>{addFunds.goal.name}</strong>
            </p>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Jumlah (Rp)</label>
              <input className="form-input" type="number" placeholder="0" min="0" inputMode="numeric" value={addFunds.amount} onChange={e => setAddFunds(af => af ? { ...af, amount: e.target.value } : null)} style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setAddFunds(null)}>Batal</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleAddFunds}>Tambah Dana</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)} title="Hapus Tujuan?">
        <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', marginTop: 0 }}>Tujuan tabungan ini akan dihapus permanen.</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setConfirmDel(null)}>Batal</button>
          <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => { deleteSavingsGoal(confirmDel!); setConfirmDel(null) }}>Hapus</button>
        </div>
      </Modal>
    </div>
  )
}
