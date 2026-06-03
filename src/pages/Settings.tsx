import { useState } from 'react'
import { Sun, Moon, Monitor, ChevronRight, RotateCcw, Download, Trash2, Shield, Info } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppStore } from '../store'
import Modal from '../components/ui/Modal'
import type { Theme } from '../types'

const CURRENCIES = [
  { code: 'IDR', label: 'Rupiah (Rp)', symbol: 'Rp' },
  { code: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { code: 'EUR', label: 'Euro (€)', symbol: '€' },
  { code: 'SGD', label: 'Singapore Dollar (S$)', symbol: 'S$' },
  { code: 'MYR', label: 'Ringgit (RM)', symbol: 'RM' },
]

function SettingRow({ icon, label, sublabel, children, onClick }: {
  icon: React.ReactNode
  label: string
  sublabel?: string
  children?: React.ReactNode
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick && !children}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.875rem',
        width: '100%', padding: '0.875rem 1rem', background: 'transparent',
        border: 'none', cursor: onClick ? 'pointer' : 'default', textAlign: 'left',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>{label}</div>
        {sublabel && <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 1, fontWeight: 400 }}>{sublabel}</div>}
      </div>
      {children || (onClick && <ChevronRight size={15} style={{ color: 'var(--text-3)', flexShrink: 0 }} />)}
    </button>
  )
}

export default function Settings() {
  const { settings, updateSettings, transactions, categories, budgets, savingsGoals, resetAllData } = useAppStore()
  const [showReset, setShowReset] = useState(false)
  const [showCurrency, setShowCurrency] = useState(false)

  const handleTheme = (theme: Theme) => {
    updateSettings({ theme })
  }

  const handleExport = () => {
    const data = { transactions, categories, budgets, savingsGoals, settings, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `moneyflow-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleReset = () => {
    resetAllData()
    setShowReset(false)
  }

  const themeOptions: { value: Theme; icon: React.ReactNode; label: string }[] = [
    { value: 'dark',   icon: <Moon size={16} />,    label: 'Gelap' },
    { value: 'light',  icon: <Sun size={16} />,     label: 'Terang' },
    { value: 'system', icon: <Monitor size={16} />, label: 'Sistem' },
  ]

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Pengaturan</h1>
        <p className="page-subtitle">Preferensi & konfigurasi</p>
      </div>

      {/* ── Tampilan ───────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1.25rem' }}>
        <p className="section-title">Tampilan</p>
        <div className="card" style={{ overflow: 'hidden', padding: '1.125rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: '0.75rem' }}>Mode Tampilan</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {themeOptions.map(({ value, icon, label }) => {
              const active = settings.theme === value
              return (
                <button
                  key={value}
                  onClick={() => handleTheme(value)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    padding: '0.75rem 0.5rem',
                    borderRadius: 10,
                    border: `2px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                    background: active ? 'var(--accent-dim)' : 'var(--card)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    color: active ? 'var(--accent)' : 'var(--text-3)',
                    fontFamily: 'inherit',
                  }}
                >
                  {icon}
                  <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>{label}</span>
                </button>
              )
            })}
          </div>
          <div style={{ marginTop: '0.875rem', fontSize: '0.75rem', color: 'var(--text-3)', lineHeight: 1.5 }}>
            {settings.theme === 'dark' && '🌙 Mode gelap aktif — nyaman di malam hari'}
            {settings.theme === 'light' && '☀️ Mode terang aktif — bersih dan jernih'}
            {settings.theme === 'system' && '🖥️ Mengikuti preferensi sistem perangkat'}
          </div>
        </div>
      </motion.div>

      {/* ── Keuangan ──────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} style={{ marginBottom: '1.25rem' }}>
        <p className="section-title">Keuangan</p>
        <div className="card" style={{ overflow: 'hidden' }}>
          <SettingRow
            icon={<span style={{ fontWeight: 700, fontSize: '0.8rem' }}>{CURRENCIES.find(c => c.code === settings.currency)?.symbol || 'Rp'}</span>}
            label="Mata Uang"
            sublabel={CURRENCIES.find(c => c.code === settings.currency)?.label || 'Rupiah (Rp)'}
            onClick={() => setShowCurrency(true)}
          />
        </div>
      </motion.div>

      {/* ── Data ──────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ marginBottom: '1.25rem' }}>
        <p className="section-title">Manajemen Data</p>
        <div className="card" style={{ overflow: 'hidden' }}>
          <SettingRow
            icon={<Download size={15} />}
            label="Ekspor Data"
            sublabel="Unduh backup data sebagai JSON"
            onClick={handleExport}
          />
          <div style={{ borderBottom: 'none' }}>
            <button
              onClick={() => setShowReset(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.875rem',
                width: '100%', padding: '0.875rem 1rem', background: 'transparent',
                border: 'none', cursor: 'pointer', textAlign: 'left',
              }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--expense-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--expense)', flexShrink: 0 }}>
                <RotateCcw size={15} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--expense)' }}>Reset Data</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 1 }}>Hapus semua data dan kembali ke awal</div>
              </div>
              <ChevronRight size={15} style={{ color: 'var(--text-3)' }} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Statistik ─────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }} style={{ marginBottom: '1.25rem' }}>
        <p className="section-title">Statistik Aplikasi</p>
        <div className="card" style={{ padding: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {[
            { val: transactions.length, label: 'Transaksi' },
            { val: categories.length, label: 'Kategori' },
            { val: budgets.length, label: 'Anggaran' },
            { val: savingsGoals.length, label: 'Tabungan' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--card)', borderRadius: 8, padding: '0.75rem', textAlign: 'center', border: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'Syne, system-ui', fontWeight: 800, fontSize: '1.5rem', color: 'var(--text)' }}>{s.val}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', marginTop: 2, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Tentang ───────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} style={{ marginBottom: '2rem' }}>
        <p className="section-title">Tentang</p>
        <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 0.875rem', boxShadow: 'var(--shadow-glow)',
          }}>
            <span style={{ fontFamily: 'Syne, system-ui', fontWeight: 800, fontSize: '1.25rem', color: '#000' }}>M</span>
          </div>
          <div style={{ fontFamily: 'Syne, system-ui', fontWeight: 800, fontSize: '1.125rem', color: 'var(--text)', marginBottom: 4 }}>MoneyFlow</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: 2 }}>Versi 1.0.0</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Aplikasi keuangan pribadi offline-first</div>
          <div style={{ marginTop: '1rem', padding: '0.625rem', background: 'var(--accent-dim)', borderRadius: 8, border: '1px solid var(--border-focus)', fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>
            🔒 Data tersimpan lokal di perangkat kamu
          </div>
        </div>
      </motion.div>

      {/* Currency Modal */}
      <Modal open={showCurrency} onClose={() => setShowCurrency(false)} title="Pilih Mata Uang">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {CURRENCIES.map(c => (
            <button
              key={c.code}
              onClick={() => { updateSettings({ currency: c.code }); setShowCurrency(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '0.875rem', borderRadius: 10, border: `2px solid ${settings.currency === c.code ? 'var(--accent)' : 'var(--border)'}`,
                background: settings.currency === c.code ? 'var(--accent-dim)' : 'var(--card)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1rem', color: settings.currency === c.code ? 'var(--accent)' : 'var(--text-2)', width: 28 }}>{c.symbol}</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: settings.currency === c.code ? 'var(--accent)' : 'var(--text)', textAlign: 'left', flex: 1 }}>{c.label}</span>
              {settings.currency === c.code && <span style={{ color: 'var(--accent)', fontSize: '0.875rem' }}>✓</span>}
            </button>
          ))}
        </div>
      </Modal>

      {/* Reset Modal */}
      <Modal open={showReset} onClose={() => setShowReset(false)} title="Reset Semua Data?">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'var(--expense-dim)', border: '1px solid rgba(255,77,114,0.2)', borderRadius: 10, padding: '1rem', display: 'flex', gap: 10 }}>
            <Trash2 size={18} style={{ color: 'var(--expense)', flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--expense)', marginBottom: 4 }}>Peringatan!</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.5 }}>
                Semua data transaksi, anggaran, dan tabungan akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.
              </div>
            </div>
          </div>
          <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', margin: 0 }}>
            Pastikan kamu sudah mengekspor data sebelum mereset.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowReset(false)}>Batal</button>
            <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleReset}>Reset Sekarang</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
