import { readdirSync, readFileSync } from 'node:fs'
import { join, posix, relative } from 'node:path'

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function parseScalar(raw) {
  const trimmed = raw.trim()
  if (!trimmed) return ''

  if (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length >= 2) {
    return trimmed
      .slice(1, -1)
      .replace(/\\(["\\])/g, '$1')
      .replace(/\\n/g, '\n')
  }

  if (trimmed.startsWith("'") && trimmed.endsWith("'") && trimmed.length >= 2) {
    return trimmed.slice(1, -1).replace(/''/g, "'")
  }

  const withoutComment = trimmed.replace(/\s+#.*$/, '').trim()
  if (withoutComment === 'true') return true
  if (withoutComment === 'false') return false
  return withoutComment
}

export function parseFrontmatter(source) {
  const normalized = source.replace(/^\uFEFF/, '')
  const match = normalized.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  if (!match) {
    return {
      data: { title: '', description: '', protected: false },
      body: normalized,
    }
  }

  const rawFrontmatter = match[1]
  const body = normalized.slice(match[0].length)
  const fields = {}

  for (const line of rawFrontmatter.split(/\r?\n/)) {
    if (!line.trim() || /^\s*#/.test(line)) continue
    const entry = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/)
    if (!entry) continue
    const [, key, value] = entry
    fields[key] = parseScalar(value)
  }

  return {
    data: {
      title: typeof fields.title === 'string' ? fields.title : '',
      description: typeof fields.description === 'string' ? fields.description : '',
      protected: fields.protected === true,
    },
    body,
  }
}

export function extractPlaintextProbe(body) {
  let inCodeFence = false

  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (/^(`{3,}|~{3,})/.test(line)) {
      inCodeFence = !inCodeFence
      continue
    }
    if (inCodeFence || !line) continue
    if (/^(import|export)\s/.test(line)) continue
    if (/^[-*_]{3,}$/.test(line)) continue
    if (/^<!--[\s\S]*-->$/.test(line)) continue

    const cleaned = line
      .replace(/^#{1,6}\s+/, '')
      .replace(/^>\s*/, '')
      .replace(/^(?:[-*+]|\d+\.)\s+/, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[*_`~]/g, '')
      .trim()

    if (cleaned.length >= 2) return cleaned
  }

  return ''
}

function walkDocs(dir) {
  const results = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...walkDocs(fullPath))
    } else if (entry.isFile() && /\.mdx?$/i.test(entry.name)) {
      results.push(fullPath)
    }
  }
  return results
}

export function collectDocs(docsDir = 'src/content/docs', distDir = 'dist') {
  const files = walkDocs(docsDir)
  return files
    .map((filePath) => {
      const rel = relative(docsDir, filePath).split('\\').join('/')
      const slug = rel.replace(/\.mdx?$/i, '')
      const source = readFileSync(filePath, 'utf8')
      const { data, body } = parseFrontmatter(source)
      return {
        slug,
        route: `/docs/${slug}`,
        distHtml: posix.join(distDir, 'docs', slug, 'index.html'),
        filePath,
        title: data.title,
        description: data.description,
        protected: data.protected,
        body,
        plaintextProbe: extractPlaintextProbe(body),
      }
    })
    .sort((a, b) => a.slug.localeCompare(b.slug))
}
