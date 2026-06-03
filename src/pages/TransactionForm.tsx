import { useState } from 'react'
import { useAppStore } from '../store'
import type { Transaction, TransactionType } from '../types'

interface Props {
  initial?: Partial<Transaction>
  onSuccess: () => void
  onCancel: () => void
}

export default function TransactionForm({ initial, onSuccess, onCancel }: Props) {
  const { categories, addTransaction, updateTransaction } = useAppStore()
  const [type, setType] = useState<TransactionType>(initial?.type || 'expense')
  const [amount, setAmount] = useState(initial?.amount?.toString() || '')
  const [categoryId, setCategoryId] = useState(initial?.categoryId || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [date, setDate] = useState(
    initial?.date
      ? new Date(initial.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  )
  const [notes, setNotes] = useState(initial?.notes || '')
  const [error, setError] = useState('')

  const filteredCategories = categories.filter(c => c.type === type || c.type === 'both')

  const handleSubmit = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Masukkan nominal yang valid')
      return
    }
    if (!categoryId) {
      setError('Pilih kategori')
      return
    }
    if (!description.trim()) {
      setError('Masukkan deskripsi')
      return
    }

    const payload = {
      type,
      amount: Number(amount),
      categoryId,
      description: description.trim(),
      date: new Date(date).toISOString(),
      notes: notes.trim() || undefined,
    }

    if (initial?.id) {
      updateTransaction(initial.id, payload)
    } else {
      addTransaction(payload)
    }
    onSuccess()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Type Toggle */}
      <div style={{ display: 'flex', background: 'var(--card)', borderRadius: 10, padding: 4, border: '1px solid var(--border)', gap: 4 }}>
        {(['expense', 'income'] as TransactionType[]).map(t => (
          <button
            key={t}
            onClick={() => { setType(t); setCategoryId('') }}
            style={{
              flex: 1, padding: '0.5rem', borderRadius: 8, border: 'none',
              cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', fontFamily: 'inherit',
              background: type === t
                ? (t === 'income' ? 'var(--income)' : 'var(--expense)')
                : 'transparent',
              color: type === t ? '#000' : 'var(--text-3)',
              transition: 'all 0.15s',
            }}
          >
            {t === 'income' ? 'Pemasukan' : 'Pengeluaran'}
          </button>
        ))}
      </div>

      {/* Amount */}
      <div>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>
          Nominal (Rp)
        </label>
        <input
          className="form-input"
          type="number"
          placeholder="0"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          min="0"
          inputMode="numeric"
          style={{ fontSize: '1.25rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}
        />
        {amount && !isNaN(Number(amount)) && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 4 }}>
            Rp {Number(amount).toLocaleString('id-ID')}
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>
          Deskripsi
        </label>
        <input
          className="form-input"
          type="text"
          placeholder="Contoh: Makan siang bersama"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>

      {/* Category */}
      <div>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>
          Kategori
        </label>
        <select
          className="form-input"
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
        >
          <option value="">Pilih kategori...</option>
          {filteredCategories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Date */}
      <div>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>
          Tanggal
        </label>
        <input
          className="form-input"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </div>

      {/* Notes (optional) */}
      <div>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>
          Catatan (opsional)
        </label>
        <textarea
          className="form-input"
          placeholder="Catatan tambahan..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          style={{ resize: 'none' }}
        />
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: 'var(--expense-dim)', color: 'var(--expense)',
          border: '1px solid rgba(255,77,114,0.2)', borderRadius: 8,
          padding: '0.625rem 0.875rem', fontSize: '0.8rem', fontWeight: 500
        }}>
          {error}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button className="btn btn-ghost" onClick={onCancel} style={{ flex: 1 }}>
          Batal
        </button>
        <button className="btn btn-primary" onClick={handleSubmit} style={{ flex: 2 }}>
          {initial?.id ? 'Simpan' : 'Tambah'}
        </button>
      </div>
    </div>
  )
}
