import { describe, it, expect } from 'vitest'
import { renderSidebar, type MetaEntry } from './sidebar'

describe('renderSidebar', () => {
  it('renders a single MetaItem as a sidebar link', () => {
    const entries: MetaEntry[] = [
      { label: '快速开始', slug: 'getting-started' },
    ]

    const html = renderSidebar(entries)

    expect(html).toContain('快速开始')
    expect(html).toContain('href="/docs/getting-started"')
    expect(html).toContain('sidebar-item')
    expect(html).toContain('font-weight:500')
  })

  it('renders a MetaGroup with collapsible items and slug-based DOM id', () => {
    const entries: MetaEntry[] = [
      {
        label: '开发指南',
        slug: 'dev',
        items: [
          { label: '架构设计', slug: 'dev/architecture' },
          { label: '接口说明', slug: 'dev/api-reference' },
        ],
      },
    ]

    const html = renderSidebar(entries)

    // Group structure
    expect(html).toContain('data-group="dev"')
    expect(html).toContain('id="group-dev"')
    expect(html).toContain('sidebar-group-title')
    expect(html).toContain('sidebar-toggle-icon')

    // Items
    expect(html).toContain('href="/docs/dev/architecture"')
    expect(html).toContain('架构设计')
    expect(html).toContain('href="/docs/dev/api-reference"')
    expect(html).toContain('接口说明')
  })

  it('falls back to slugified label when MetaGroup has no slug', () => {
    const entries: MetaEntry[] = [
      {
        label: '开发 指南',
        items: [
          { label: '架构', slug: 'dev/arch' },
        ],
      },
    ]

    const html = renderSidebar(entries)

    // Whitespace → hyphens
    expect(html).toContain('data-group="开发-指南"')
    expect(html).toContain('id="group-开发-指南"')
  })

  it('returns empty string for empty entries array', () => {
    const html = renderSidebar([])
    expect(html).toBe('')
  })

  it('renders mixed MetaItem and MetaGroup entries', () => {
    const entries: MetaEntry[] = [
      { label: '首页', slug: 'home' },
      {
        label: '指南',
        slug: 'guides',
        items: [{ label: '入门', slug: 'guides/intro' }],
      },
    ]

    const html = renderSidebar(entries)

    expect(html).toContain('href="/docs/home"')
    expect(html).toContain('data-group="guides"')
    expect(html).toContain('href="/docs/guides/intro"')
  })
})
