export interface MetaItem {
  label: string
  slug: string
}

export interface MetaGroup {
  label: string
  slug?: string
  items: MetaItem[]
}

export type MetaEntry = MetaItem | MetaGroup

/** Escape a value before interpolating it into the sidebar HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Fallback DOM id for a group that has no explicit slug. */
function slugify(label: string): string {
  return label.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\u4e00-\u9fff\u3400-\u4dbf-]/g, '')
}

export function renderSidebar(entries: MetaEntry[]): string {
  const usedIds = new Map<string, number>()

  // Groups must not collide on DOM ids, otherwise one title would toggle
  // another group's items.
  const uniqueGroupId = (entry: MetaGroup): string => {
    const base = entry.slug || slugify(entry.label) || 'group'
    const seen = usedIds.get(base) ?? 0
    usedIds.set(base, seen + 1)
    return seen === 0 ? base : `${base}-${seen + 1}`
  }

  return entries
    .map((entry) => {
      if ('items' in entry) {
        const groupId = escapeHtml(uniqueGroupId(entry))
        const items = entry.items
          .map(
            (item) => `
              <a href="/docs/${escapeHtml(item.slug)}" class="sidebar-item">${escapeHtml(item.label)}</a>
            `,
          )
          .join('')

        return `
        <div class="sidebar-group">
          <button type="button" class="sidebar-group-title" data-group="${groupId}" aria-expanded="true" aria-controls="group-${groupId}">
            ${escapeHtml(entry.label)}
            <svg class="sidebar-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>
          <div class="sidebar-items" id="group-${groupId}">
            ${items}
          </div>
        </div>`
      }

      return `
      <div class="sidebar-group">
        <a href="/docs/${escapeHtml(entry.slug)}" class="sidebar-item sidebar-item-standalone">${escapeHtml(entry.label)}</a>
      </div>`
    })
    .join('')
}
