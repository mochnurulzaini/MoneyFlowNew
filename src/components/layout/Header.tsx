import { useLocation } from 'react-router-dom'
import { TrendingUp } from 'lucide-react'

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/':             { title: 'Dashboard',    subtitle: 'Ringkasan keuangan kamu' },
  '/transactions': { title: 'Transaksi',    subtitle: 'Riwayat pemasukan & pengeluaran' },
  '/categories':   { title: 'Kategori',     subtitle: 'Kelola kategori transaksi' },
  '/budget':       { title: 'Anggaran',     subtitle: 'Pantau batas pengeluaran' },
  '/savings':      { title: 'Tabungan',     subtitle: 'Capai tujuan keuanganmu' },
  '/statistics':   { title: 'Statistik',    subtitle: 'Analisis keuangan bulanan' },
  '/settings':     { title: 'Pengaturan',   subtitle: 'Preferensi & konfigurasi' },
}

export default function Header() {
  const { pathname } = useLocation()
  const info = PAGE_TITLES[pathname] || { title: 'MoneyFlow', subtitle: '' }

  return (
    <header className="app-header">
      {/* Mobile: Logo */}
      <div className="md-hidden" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <TrendingUp size={16} color="#000" />
        </div>
        <div>
          <div style={{ fontFamily: 'Syne, system-ui', fontWeight: 800, fontSize: '1rem', color: 'var(--text)', lineHeight: 1.1 }}>
            MoneyFlow
          </div>
        </div>
      </div>

      {/* Desktop: Page title */}
      <div style={{ display: 'none' }} className="desktop-title">
        <div style={{ fontFamily: 'Syne, system-ui', fontWeight: 800, fontSize: '1.125rem', color: 'var(--text)', lineHeight: 1.2 }}>
          {info.title}
        </div>
        {info.subtitle && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 1 }}>
            {info.subtitle}
          </div>
        )}
      </div>

      {/* Right: Date */}
      <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 500, flexShrink: 0 }}>
        {new Date().toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
      </div>
    </header>
  )
}
