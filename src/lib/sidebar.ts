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

export interface SidebarValidationResult {
  missingSlugs: string[]
  duplicateSlugs: string[]
  unlistedSlugs: string[]
}

export function collectSidebarSlugs(entries: MetaEntry[]): string[] {
  return entries.flatMap((entry) => ('items' in entry ? entry.items.map((item) => item.slug) : [entry.slug]))
}

export function validateSidebar(entries: MetaEntry[], availableSlugs: Iterable<string>): SidebarValidationResult {
  const available = new Set(availableSlugs)
  const seen = new Set<string>()
  const missingSlugs: string[] = []
  const duplicateSlugs: string[] = []

  for (const slug of collectSidebarSlugs(entries)) {
    if (seen.has(slug)) {
      if (!duplicateSlugs.includes(slug)) duplicateSlugs.push(slug)
    } else {
      seen.add(slug)
    }
    if (!available.has(slug) && !missingSlugs.includes(slug)) {
      missingSlugs.push(slug)
    }
  }

  const unlistedSlugs = [...available].filter((slug) => !seen.has(slug))
  return { missingSlugs, duplicateSlugs, unlistedSlugs }
}

export function assertValidSidebar(entries: MetaEntry[], availableSlugs: Iterable<string>): void {
  const { missingSlugs, duplicateSlugs } = validateSidebar(entries, availableSlugs)
  const problems: string[] = []
  if (missingSlugs.length > 0) problems.push(`missing docs for slugs: ${missingSlugs.join(', ')}`)
  if (duplicateSlugs.length > 0) problems.push(`duplicate slugs: ${duplicateSlugs.join(', ')}`)
  if (problems.length > 0) {
    throw new Error(`Invalid sidebar configuration in src/content/docs/_meta.ts (${problems.join('; ')})`)
  }
}

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

export function renderSidebar(entries: MetaEntry[], currentPath?: string): string {
  const usedIds = new Set<string>()

  const uniqueGroupId = (entry: MetaGroup): string => {
    const base = entry.slug || slugify(entry.label) || 'group'
    let id = base
    for (let suffix = 2; usedIds.has(id); suffix++) id = `${base}-${suffix}`
    usedIds.add(id)
    return id
  }

  function renderItem(item: MetaItem, standalone = false): string {
    const path = '/docs/' + item.slug
    const selected = path === currentPath ? ' aria-current="page"' : ''
    const classes = 'sidebar-item block-row' + (standalone ? ' sidebar-item-standalone' : '')
    return `<a href="${escapeHtml(path)}" class="${classes}"${selected}>${escapeHtml(item.label)}</a>`
  }

  return entries
    .map((entry) => {
      if ('items' in entry) {
        const groupId = escapeHtml(uniqueGroupId(entry))
        const items = entry.items.map((item) => renderItem(item)).join('')

        return `
        <div class="sidebar-group">
          <button type="button" class="sidebar-group-title block-row" data-group="${groupId}" aria-expanded="true" aria-controls="group-${groupId}">
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
        ${renderItem(entry, true)}
      </div>`
    })
    .join('')
}
