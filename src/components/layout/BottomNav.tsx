import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, BarChart3, Settings, PiggyBank } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/',            icon: LayoutDashboard, label: 'Beranda' },
  { to: '/transactions',icon: ArrowLeftRight,  label: 'Transaksi' },
  { to: '/savings',     icon: PiggyBank,       label: 'Tabungan' },
  { to: '/statistics',  icon: BarChart3,       label: 'Statistik' },
  { to: '/settings',    icon: Settings,        label: 'Lainnya' },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          {({ isActive }) => (
            <>
              <div className="nav-item-icon">
                <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
              </div>
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
