import * as LucideIcons from 'lucide-react'
import type { LucideProps } from 'lucide-react'

type IconName = keyof typeof LucideIcons

interface CategoryIconProps {
  name: string
  size?: number
  color?: string
  bgColor?: string
  className?: string
}

export function CategoryIcon({ name, size = 18, color, bgColor, className }: CategoryIconProps) {
  const IconComp = (LucideIcons[name as IconName] || LucideIcons.Tag) as React.ComponentType<LucideProps>

  if (bgColor) {
    return (
      <div
        className={`cat-icon ${className || ''}`}
        style={{ background: bgColor + '22', color: bgColor }}
      >
        <IconComp size={size} />
      </div>
    )
  }

  return <IconComp size={size} color={color} />
}

// Icon names available for picking
export const ICON_OPTIONS = [
  'UtensilsCrossed', 'Car', 'Gamepad2', 'ShoppingBag', 'Heart', 'Receipt',
  'BookOpen', 'MoreHorizontal', 'Wallet', 'Laptop', 'TrendingUp', 'Gift',
  'Home', 'Plane', 'Coffee', 'Music', 'Film', 'Dumbbell', 'Shirt', 'Baby',
  'PawPrint', 'Bike', 'Train', 'Bus', 'Fuel', 'Wrench', 'Phone', 'Tv',
  'Package', 'Star', 'Zap', 'Droplet', 'Sun', 'Umbrella', 'Camera',
  'Scissors', 'Pill', 'Stethoscope', 'GraduationCap', 'Briefcase', 'Bank',
] as const

export const COLOR_OPTIONS = [
  '#ff4d72', '#ff8855', '#ffb800', '#00e5c3', '#00e59a', '#4d9fff',
  '#8b73ff', '#a78bfa', '#94a3b8', '#00bcd4', '#e91e63', '#9c27b0',
  '#3f51b5', '#009688', '#4caf50', '#ff5722', '#607d8b', '#795548',
]
