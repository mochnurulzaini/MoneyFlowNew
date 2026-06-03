import { useState, useEffect, useRef } from 'react'
import { RefreshCw } from 'lucide-react'

const THRESHOLD = 60
const MAX_PULL = 90

export default function PullToRefresh() {
  const [pullY, setPullY] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const startYRef = useRef(0)
  const startXRef = useRef(0)
  const canPullRef = useRef(false)
  const pulledRef = useRef(false)

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      const scrollable = document.querySelector('.page-scroll')
      const scrollTop = scrollable ? scrollable.scrollTop : window.scrollY
      if (scrollTop <= 0) {
        startYRef.current = e.touches[0].clientY
        startXRef.current = e.touches[0].clientX
        canPullRef.current = true
        pulledRef.current = false
      } else {
        canPullRef.current = false
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!canPullRef.current || isRefreshing) return
      const dx = e.touches[0].clientX - startXRef.current
      const dy = e.touches[0].clientY - startYRef.current
      if (dy > 0 && Math.abs(dy) > Math.abs(dx)) {
        if (dy > 12) {
          e.preventDefault()
        }
        const clamped = Math.min(dy * 0.35, MAX_PULL)
        setPullY(clamped)
        pulledRef.current = clamped >= THRESHOLD
      } else {
        canPullRef.current = false
        setPullY(0)
        pulledRef.current = false
      }
    }

    const onTouchEnd = () => {
      if (!canPullRef.current) return
      canPullRef.current = false
      if (pulledRef.current && !isRefreshing) {
        setIsRefreshing(true)
        setTimeout(() => {
          window.location.reload()
        }, 600)
      } else {
        setPullY(0)
        pulledRef.current = false
      }
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchmove', onTouchMove, { passive: false })
    document.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [isRefreshing])

  const isVisible = pullY > 4 || isRefreshing
  const progress = Math.min(pullY / THRESHOLD, 1)
  const isPulledEnough = pullY >= THRESHOLD

  if (!isVisible) return null

  return (
    <div
      className="ptr-container"
      style={{
        top: `calc(env(safe-area-inset-top, 0px) + 44px + ${pullY * 0.3}px)`,
        transition: pullY === 0 || isRefreshing ? 'all 0.3s ease' : 'none',
        opacity: Math.min(progress * 2, 1),
      }}
    >
      <div className="ptr-spinner">
        <RefreshCw
          size={16}
          style={{
            transform: `rotate(${progress * 360}deg)`,
            animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none',
            color: isPulledEnough ? 'var(--accent)' : 'var(--text-3)',
            transition: 'color 0.2s',
          }}
        />
      </div>
    </div>
  )
}
