import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ClipboardList,
  CheckSquare,
  DollarSign,
  Scale,
  Shield
} from 'lucide-react'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/incidents', icon: ClipboardList, label: 'Incident Register' },
  { path: '/actions', icon: CheckSquare, label: 'Action Items' },
  { path: '/costs', icon: DollarSign, label: 'Cost Tracking' },
  { path: '/legal', icon: Scale, label: 'Legal Items' },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-800 text-white min-h-screen flex flex-col">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="font-bold text-lg">Incident Response</h1>
            <p className="text-xs text-slate-400">Management System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map(({ path, icon: Icon, label }) => (
            <li key={path}>
              <NavLink
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-700 text-xs text-slate-400">
        <p>Data stored locally in browser</p>
      </div>
    </aside>
  )
}
