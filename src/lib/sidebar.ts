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

export function renderSidebar(entries: MetaEntry[]): string {
  return entries.map((entry) => {
    if ('items' in entry) {
      const groupId = entry.slug || entry.label
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9\u4e00-\u9fff\u3400-\u4dbf-]/g, '')
      return `
        <div class="sidebar-group">
          <div class="sidebar-group-title" data-group="${groupId}">
            ${entry.label}
            <svg class="sidebar-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </div>
          <div class="sidebar-items" id="group-${groupId}">
            ${entry.items.map((item) => `
              <a href="/docs/${item.slug}" class="sidebar-item">${item.label}</a>
            `).join('')}
          </div>
        </div>`
    }
    return `
      <div class="sidebar-group">
        <a href="/docs/${entry.slug}" class="sidebar-item" style="font-weight:500">${entry.label}</a>
      </div>`
  }).join('')
}
