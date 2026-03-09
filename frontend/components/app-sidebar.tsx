'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Activity,
  AlertTriangle,
  TrendingUp,
  Shield,
  FileText,
  Server,
  Brain,
  Settings,
  LogOut,
} from 'lucide-react'

const menuItems = [
  { title: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { title: 'Traffic Monitor', icon: Activity, href: '/traffic' },
  { title: 'Alerts', icon: AlertTriangle, href: '/alerts' },
  { title: 'Attack Analytics', icon: TrendingUp, href: '/attacks' },
  { title: 'Threat Intelligence', icon: Shield, href: '/threats' },
  { title: 'Logs Explorer', icon: FileText, href: '/logs' },
  { title: 'Devices', icon: Server, href: '/devices' },
  { title: 'Model Insights', icon: Brain, href: '/model' },
  { title: 'Settings', icon: Settings, href: '/settings' },
]

export function AppSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname?.startsWith(href)
  }

  return (
    <aside className="w-64 min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="border-b border-sidebar-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold">
            CS
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-tight">CyberShield</span>
            <span className="text-xs text-sidebar-foreground/60">Security Monitor</span>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                  isActive(item.href)
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <button
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}

