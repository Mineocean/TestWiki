import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { runInNewContext } from 'node:vm'
import { brotliDecompressSync, gunzipSync } from 'node:zlib'
import { collectDocs, escapeHtml } from './docs-manifest.mjs'

const docs = collectDocs()
const protectedDocs = docs.filter((doc) => doc.protected)
const publicDocs = docs.filter((doc) => !doc.protected)

if (protectedDocs.length > 0 && !process.env.STATICRYPT_PASSWORD) {
  try {
    process.loadEnvFile()
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
}

function decodeFragment(buffer) {
  try {
    return brotliDecompressSync(buffer).toString('utf8')
  } catch {
    return gunzipSync(buffer).toString('utf8')
  }
}

const fragmentDir = 'dist/pagefind/fragment'
const fragments = readdirSync(fragmentDir).map((file) => {
  const text = decodeFragment(readFileSync(join(fragmentDir, file)))
  const { content, url } = JSON.parse(text.replace(/^pagefind_dcd/, ''))
  return {
    content: content.replaceAll('\u200b', ''),
    route: url.replace(/\/index\.html$/, '').replace(/\/$/, '') || '/',
  }
})
const indexedRoutes = new Set(fragments.map((fragment) => fragment.route))

const password = process.env.STATICRYPT_PASSWORD

for (const doc of protectedDocs) {
  const protectedHtml = readFileSync(doc.distHtml, 'utf8')
  const probe = doc.plaintextProbe
  assert(probe, `Protected document ${doc.slug} must contain plaintext content to verify encryption.`)

  assert(!protectedHtml.includes(probe), `Protected page ${doc.route} must not contain its plaintext content.`)
  assert.match(protectedHtml, /id="staticrypt-form"/)
  assert.match(protectedHtml, /staticrypt\.handleDecryptionOfPage\(/)
  assert(
    protectedHtml.includes(escapeHtml(doc.title || doc.slug)),
    `Protected page ${doc.route} must display its document title.`,
  )

  const runtime = protectedHtml.match(/const staticryptInitiator = [\s\S]+?;\s*const staticryptConfig = \{[^\r\n]*\};/)
  assert(runtime, `Protected page ${doc.route} must contain the StatiCrypt runtime and encrypted document.`)

  if (password) {
    let unlockedHtml = ''
    const unlock = runInNewContext(
      runtime[0] + '\nstaticryptInitiator.init(staticryptConfig, { replaceHtmlCallback }).handleDecryptionOfPage',
      {
        crypto,
        TextEncoder,
        TextDecoder,
        replaceHtmlCallback: (html) => {
          unlockedHtml = html
        },
      },
    )
    assert.equal((await unlock(password + '-wrong', false)).isSuccessful, false)
    assert.equal(unlockedHtml, '')
    assert.equal((await unlock(password, false)).isSuccessful, true)
    assert(unlockedHtml.includes(probe), `The password must reveal the protected document ${doc.route}.`)
  }

  assert(!indexedRoutes.has(doc.route), `The search index must exclude protected document ${doc.route}.`)
  for (const fragment of fragments) {
    assert(
      !fragment.content.includes(probe),
      `The search index must not leak plaintext from protected document ${doc.route}.`,
    )
  }
}

for (const route of ['/', ...publicDocs.map((doc) => doc.route)]) {
  assert(indexedRoutes.has(route), `Missing search index entry for ${route}`)
}

console.log(
  `Build checks passed: ${protectedDocs.length} protected page(s) and ${publicDocs.length + 1} public search route(s).`,
)
