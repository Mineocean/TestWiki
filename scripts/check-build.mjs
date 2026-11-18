import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { runInNewContext } from 'node:vm'
import { brotliDecompressSync, gunzipSync } from 'node:zlib'

if (!process.env.STATICRYPT_PASSWORD) {
  try {
    process.loadEnvFile()
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
}

const protectedPage = 'dist/docs/dev/secret/index.html'
const protectedHtml = readFileSync(protectedPage, 'utf8')
const privateSection = '机密内容'

assert(!protectedHtml.includes(privateSection), 'The protected page must not contain its plaintext section.')
assert.match(protectedHtml, /id="staticrypt-form"/)
assert.match(protectedHtml, /staticrypt\.handleDecryptionOfPage\(/)

const runtime = protectedHtml.match(/const staticryptInitiator = [\s\S]+?;\s*const staticryptConfig = \{[^\r\n]*\};/)
assert(runtime, 'The protected page must contain the StatiCrypt runtime and encrypted document.')

const password = process.env.STATICRYPT_PASSWORD
if (password) {
  let unlockedHtml = ''
  const unlock = runInNewContext(
    runtime[0] + '\nstaticryptInitiator.init(staticryptConfig, { replaceHtmlCallback }).handleDecryptionOfPage',
    {
      crypto,
      TextEncoder,
      TextDecoder,
      replaceHtmlCallback: (html) => { unlockedHtml = html },
    },
  )
  assert.equal((await unlock(password + '-wrong', false)).isSuccessful, false)
  assert.equal(unlockedHtml, '')
  assert.equal((await unlock(password, false)).isSuccessful, true)
  assert(unlockedHtml.includes(privateSection), 'The password must reveal the protected document.')
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
  assert(!content.replaceAll('\u200b', '').includes(privateSection), 'The search index must exclude the protected text.')
  return url.replace(/\/index\.html$/, '').replace(/\/$/, '') || '/'
})

assert(!fragments.includes('/docs/dev/secret'), 'The search index must exclude the protected document.')
for (const route of ['/', '/docs/getting-started', '/docs/dev/architecture', '/docs/dev/api-reference']) {
  assert(fragments.includes(route), 'Missing search index entry for ' + route)
}

console.log('Build checks passed: password page and public search index.')
