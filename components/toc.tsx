'use client'

import { useCallback, useEffect, useState } from 'react'

interface TocItem {
  id: string
  title: string
  level: number
}

export function Toc() {
  const [headings, setHeadings] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLHeadingElement>('article h2, article h3')
    )

    const items: TocItem[] = elements.map((el, i) => {
      if (!el.id) {
        el.id = `heading-${i}`
      }
      return {
        id: el.id,
        title: el.textContent ?? '',
        level: el.tagName === 'H2' ? 2 : 3,
      }
    })

    setHeadings(items)
  }, [])

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-80px 0px -80% 0px' }
    )

    headings.forEach((h) => {
      const el = document.getElementById(h.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings])

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  if (headings.length === 0) return null

  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-48 shrink-0 overflow-y-auto py-6 pl-3 pr-4 xl:block">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
        本页目录
      </p>
      <nav className="flex flex-col gap-0.5 border-l border-neutral-200">
        {headings.map((heading) => (
          <button
            key={heading.id}
            onClick={() => scrollTo(heading.id)}
            className={`text-left text-sm transition-colors hover:text-neutral-900 ${
              heading.level === 3 ? 'pl-3' : ''
            } ${
              activeId === heading.id
                ? 'border-l-2 -ml-px border-purple-500 pl-2.5 font-medium text-purple-700'
                : 'text-neutral-500'
            }`}
          >
            <span className="block truncate py-1">{heading.title}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}
