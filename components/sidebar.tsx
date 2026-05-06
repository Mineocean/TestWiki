'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { sidebar } from '@/lib/source'

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const toggleGroup = (text: string) => {
    setCollapsed((prev) => ({ ...prev, [text]: !prev[text] }))
  }

  return (
    <aside className="sidebar-scrollbar sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r border-neutral-200/70 py-6 pl-4 pr-3 md:block">
      <nav className="flex flex-col gap-5">
        {sidebar.map((group) => (
          <div key={group.text}>
            <button
              onClick={() => toggleGroup(group.text)}
              className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-xs font-semibold uppercase tracking-wider text-neutral-400 transition-colors hover:text-neutral-600"
            >
              {group.text}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${
                  collapsed[group.text] ? '-rotate-90' : ''
                }`}
              />
            </button>
            {!collapsed[group.text] && (
              <div className="mt-1 flex flex-col gap-0.5">
                {group.items.map((item) => (
                  <Link
                    key={item.link}
                    href={item.link}
                    className={`rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
                      pathname === item.link
                        ? 'bg-purple-50 font-medium text-purple-700'
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                    }`}
                  >
                    {item.text}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  )
}
