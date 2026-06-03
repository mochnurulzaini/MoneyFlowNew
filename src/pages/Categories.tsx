import { useState } from 'react'
import { Plus, Edit2, Trash2, Tag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../store'
import { CategoryIcon, ICON_OPTIONS, COLOR_OPTIONS } from '../components/ui/CategoryIcon'
import Modal from '../components/ui/Modal'
import type { Category } from '../types'
import { getCategorySpend, formatCurrency, isSameMonth } from '../utils'

interface FormState { name: string; icon: string; color: string; type: 'income' | 'expense' | 'both' }
const EMPTY: FormState = { name: '', icon: 'Tag', color: '#00e5c3', type: 'expense' }

export default function Categories() {
  const { categories, transactions, addCategory, updateCategory, deleteCategory, settings } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [confirmDel, setConfirmDel] = useState<string | null>(null)
  const [error, setError] = useState('')

  const now = new Date()
  const visible = categories.filter(c => filterType === 'all' || c.type === filterType || c.type === 'both')

  const openAdd = () => { setForm(EMPTY); setEditing(null); setError(''); setShowForm(true) }
  const openEdit = (c: Category) => { setForm({ name: c.name, icon: c.icon, color: c.color, type: c.type }); setEditing(c); setError(''); setShowForm(true) }

  const handleSave = () => {
    if (!form.name.trim()) { setError('Nama kategori wajib diisi'); return }
    if (editing) updateCategory(editing.id, form)
    else addCategory(form)
    setShowForm(false)
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Kategori</h1>
          <p className="page-subtitle">{categories.length} kategori tersedia</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openAdd} style={{ marginTop: 4 }}>
          <Plus size={15} /> Tambah
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.25rem', background: 'var(--card)', borderRadius: 10, padding: 4, border: '1px solid var(--border)' }}>
        {(['all', 'expense', 'income'] as const).map(f => (
          <button key={f} className={`tab-btn${filterType === f ? ' active' : ''}`} onClick={() => setFilterType(f)} style={{ flex: 1 }}>
            {f === 'all' ? 'Semua' : f === 'income' ? 'Pemasukan' : 'Pengeluaran'}
          </button>
        ))}
      </div>

      {/* Category Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <AnimatePresence>
          {visible.map((cat, i) => {
            const spent = getCategorySpend(transactions.filter(t => isSameMonth(t.date, now)), cat.id)
            return (
              <motion.div
                key={cat.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.03 }}
                className="card"
                style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem' }}
              >
                <CategoryIcon name={cat.icon} size={18} bgColor={cat.color} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>{cat.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <span className={`badge ${cat.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
                      {cat.type === 'income' ? 'Pemasukan' : cat.type === 'expense' ? 'Pengeluaran' : 'Keduanya'}
                    </span>
                    {spent > 0 && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: 'JetBrains Mono, monospace' }}>
                        {formatCurrency(spent, settings.currency)} bulan ini
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn btn-icon" onClick={() => openEdit(cat)} style={{ width: 30, height: 30 }}><Edit2 size={13} /></button>
                  {!['c1','c2','c3','c4','c5','c6','c7','c8','c9','c10','c11','c12'].includes(cat.id) && (
                    <button className="btn btn-icon" onClick={() => setConfirmDel(cat.id)} style={{ width: 30, height: 30, color: 'var(--expense)' }}><Trash2 size={13} /></button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {visible.length === 0 && (
        <div className="card empty-state">
          <div className="empty-state-icon"><Tag size={24} /></div>
          <p style={{ color: 'var(--text-3)', fontSize: '0.875rem', margin: 0 }}>Tidak ada kategori</p>
        </div>
      )}

      {/* Form Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Kategori' : 'Tambah Kategori'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Name */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Nama Kategori</label>
            <input className="form-input" placeholder="Contoh: Makan Siang" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>

          {/* Type */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Jenis</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['expense', 'income', 'both'] as const).map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                  className="btn btn-sm"
                  style={{ flex: 1, background: form.type === t ? 'var(--accent)' : 'var(--card)', color: form.type === t ? '#000' : 'var(--text-3)', border: '1px solid var(--border)', transition: 'all 0.15s' }}>
                  {t === 'expense' ? 'Pengeluaran' : t === 'income' ? 'Pemasukan' : 'Keduanya'}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 8 }}>Warna</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {COLOR_OPTIONS.map(c => (
                <button
                  key={c}
                  onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={`color-dot${form.color === c ? ' selected' : ''}`}
                  style={{ background: c, border: form.color === c ? `3px solid var(--text)` : '3px solid transparent' }}
                  aria-label={c}
                />
              ))}
            </div>
          </div>

          {/* Icon */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 8 }}>Ikon</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 160, overflowY: 'auto' }}>
              {ICON_OPTIONS.map(name => (
                <button
                  key={name}
                  onClick={() => setForm(f => ({ ...f, icon: name }))}
                  style={{
                    width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: form.icon === name ? form.color + '33' : 'var(--card)',
                    color: form.icon === name ? form.color : 'var(--text-3)',
                    outline: form.icon === name ? `2px solid ${form.color}` : 'none',
                    transition: 'all 0.15s',
                  }}
                  aria-label={name}
                >
                  <CategoryIcon name={name} size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--card)', borderRadius: 10, padding: '0.75rem', border: '1px solid var(--border)' }}>
            <CategoryIcon name={form.icon} size={18} bgColor={form.color} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>{form.name || 'Nama Kategori'}</span>
          </div>

          {error && <div style={{ color: 'var(--expense)', fontSize: '0.8rem', fontWeight: 500 }}>{error}</div>}

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Batal</button>
            <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleSave}>{editing ? 'Simpan' : 'Tambah'}</button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)} title="Hapus Kategori?">
        <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', marginTop: 0 }}>Kategori ini akan dihapus. Transaksi yang terkait tidak akan terhapus.</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setConfirmDel(null)}>Batal</button>
          <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => { deleteCategory(confirmDel!); setConfirmDel(null) }}>Hapus</button>
        </div>
      </Modal>
    </div>
  )
}
