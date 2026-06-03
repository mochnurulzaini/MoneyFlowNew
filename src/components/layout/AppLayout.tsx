import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import Header from './Header'
import PullToRefresh from '../shared/PullToRefresh'
import Modal from '../ui/Modal'
import TransactionForm from '../../pages/TransactionForm'

export default function AppLayout() {
  const [fabOpen, setFabOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="app-shell">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="main-area">
        <Header />

        {/* Scrollable content */}
        <div className="page-scroll" id="page-scroll">
          <motion.div
            key={window.location.hash}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div style={{ padding: '1.25rem' }}>
              <Outlet />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <BottomNav />

      {/* Pull-to-Refresh */}
      <PullToRefresh />

      {/* FAB - Add Transaction */}
      <button
        className="fab"
        onClick={() => setFabOpen(true)}
        aria-label="Tambah Transaksi"
      >
        <Plus size={22} strokeWidth={2.5} />
      </button>

      {/* Add Transaction Modal */}
      <Modal open={fabOpen} onClose={() => setFabOpen(false)} title="Tambah Transaksi">
        <TransactionForm
          onSuccess={() => {
            setFabOpen(false)
            navigate('/transactions')
          }}
          onCancel={() => setFabOpen(false)}
        />
      </Modal>
    </div>
  )
}
