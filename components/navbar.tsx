'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Github, Menu, X } from 'lucide-react'
import { useState } from 'react'

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200/70 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-8xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-neutral-900"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-sm font-bold text-white">
            W
          </div>
          Wiki
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/docs/getting-started"
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
              pathname.startsWith('/docs')
                ? 'bg-purple-50 text-purple-700'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
            }`}
          >
            文档
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="ml-2 rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
          >
            <Github className="h-5 w-5" />
          </a>
        </nav>

        <button
          className="rounded-lg p-1.5 text-neutral-600 hover:bg-neutral-100 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-neutral-100 bg-white px-4 pb-4 pt-2 md:hidden">
          <Link
            href="/docs/getting-started"
            className="block rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
            onClick={() => setMobileOpen(false)}
          >
            文档
          </Link>
        </div>
      )}
    </header>
  )
}
