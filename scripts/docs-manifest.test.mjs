import { describe, it, expect } from 'vitest'
import { collectDocs, escapeHtml, extractPlaintextProbe, parseFrontmatter } from './docs-manifest.mjs'
import sidebar from '../src/content/docs/_meta'
import { validateSidebar } from '../src/lib/sidebar'

describe('docs-manifest', () => {
  it('parses frontmatter fields including protected boolean and quotes', () => {
    const doc = [
      '---',
      'title: "机密文档"',
      "description: '受密码保护'",
      'protected: true # inline comment',
      '---',
      '',
      '## 机密内容',
      '正文内容',
    ].join('\r\n')

    const parsed = parseFrontmatter(doc)
    expect(parsed.data).toEqual({
      title: '机密文档',
      description: '受密码保护',
      protected: true,
    })
    expect(extractPlaintextProbe(parsed.body)).toBe('机密内容')
  })

  it('defaults protected to false when omitted or false', () => {
    const parsed = parseFrontmatter('---\ntitle: 公开文档\n---\n\n一段公开正文。')
    expect(parsed.data.protected).toBe(false)
    expect(extractPlaintextProbe(parsed.body)).toBe('一段公开正文。')
  })

  it('skips code fences and MDX imports when extracting plaintext probe', () => {
    const body = [
      "import Callout from './Callout.astro'",
      '',
      '```ts',
      'const secret = 123',
      '```',
      '',
      '> 真正需要校验的正文片段',
    ].join('\n')

    expect(extractPlaintextProbe(body)).toBe('真正需要校验的正文片段')
  })

  it('escapes HTML characters for StatiCrypt template placeholders', () => {
    expect(escapeHtml('<script>"a" & \'b\'</script>')).toBe('&lt;script&gt;&quot;a&quot; &amp; &#39;b&#39;&lt;/script&gt;')
  })

  it('collects workspace docs and matches _meta.ts with no broken or duplicate slugs', () => {
    const docs = collectDocs()
    expect(docs.some((doc) => doc.slug === 'dev/secret' && doc.protected)).toBe(true)
    expect(docs.some((doc) => doc.slug === 'getting-started' && !doc.protected)).toBe(true)

    const validation = validateSidebar(sidebar, docs.map((doc) => doc.slug))
    expect(validation.missingSlugs).toEqual([])
    expect(validation.duplicateSlugs).toEqual([])
    expect(validation.unlistedSlugs).toEqual([])
  })
})
