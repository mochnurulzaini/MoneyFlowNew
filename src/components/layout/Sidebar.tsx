import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, ArrowLeftRight, Tag, PieChart,
  PiggyBank, BarChart3, Settings, TrendingUp
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/',            icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions',icon: ArrowLeftRight,  label: 'Transaksi' },
  { to: '/categories',  icon: Tag,             label: 'Kategori' },
  { to: '/budget',      icon: PieChart,        label: 'Anggaran' },
  { to: '/savings',     icon: PiggyBank,       label: 'Tabungan' },
  { to: '/statistics',  icon: BarChart3,       label: 'Statistik' },
  { to: '/settings',    icon: Settings,        label: 'Pengaturan' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{
        padding: '1.5rem 1rem 1rem',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0 0.25rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <TrendingUp size={18} color="#000" />
          </div>
          <div>
            <div style={{
              fontFamily: 'Syne, system-ui', fontWeight: 800,
              fontSize: '1.125rem', color: 'var(--text)', lineHeight: 1.1
            }}>
              MoneyFlow
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', fontWeight: 500 }}>
              Keuangan Pribadi
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '0.75rem 0', flex: 1 }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', padding: '0.5rem 1.75rem 0.25rem' }}>
          Menu
        </div>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '1rem',
        borderTop: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <div style={{
          background: 'var(--accent-dim)',
          border: '1px solid var(--border-focus)',
          borderRadius: 10,
          padding: '0.75rem',
          fontSize: '0.75rem',
          color: 'var(--accent)',
          fontWeight: 600,
          textAlign: 'center',
        }}>
          MoneyFlow v1.0
        </div>
      </div>
    </aside>
  )
}
