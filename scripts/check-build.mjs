// Post-build assertions (also run by CI).
//
// Pagefind fragments are compressed, so plain grep cannot see a leak — decode
// them first. The protected page must be encrypted, wired up, and absent from
// the search index.
import { readFileSync, readdirSync } from 'node:fs'
import { brotliDecompressSync, gunzipSync } from 'node:zlib'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

// Mirror scripts/encrypt.mjs: a gitignored .env is enough.
if (!process.env.STATICRYPT_PASSWORD) {
  try {
    process.loadEnvFile('.env')
  } catch {
    // no .env — the decryption round-trip is skipped below
  }
}

const PROTECTED_PAGE = 'dist/docs/dev/secret/index.html'
const SECRET_MARKERS = ['sk-prod-zzzzz', 'sk-dev-xxxxx', 'api.example.internal']

const failures = []
const check = (label, ok) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`)
  if (!ok) failures.push(label)
}

function decode(buffer) {
  try {
    return brotliDecompressSync(buffer).toString('utf8')
  } catch {
    try {
      return gunzipSync(buffer).toString('utf8')
    } catch {
      return buffer.toString('utf8')
    }
  }
}

// ── The protected page is encrypted and wired up ────────────────────────────
const protectedHtml = readFileSync(PROTECTED_PAGE, 'utf8')
check('protected page contains no plaintext', !SECRET_MARKERS.some((m) => protectedHtml.includes(m)))
check('protected page has the password form', protectedHtml.includes('id="staticrypt-form"'))
check('protected page initialises staticrypt', protectedHtml.includes('staticryptInitiator.init('))
check('protected page handles submission', protectedHtml.includes('handleDecryptionOfPage'))

// ── The password really decrypts it (uses staticrypt's own codec) ───────────
const password = process.env.STATICRYPT_PASSWORD
if (password) {
  const cryptoEngine = require('staticrypt/lib/cryptoEngine.js')
  const codec = require('staticrypt/lib/codec.js').init(cryptoEngine)
  const config = JSON.parse(protectedHtml.match(/staticryptConfig = (\{[\s\S]*?\});/)[1])
  const salt = config.staticryptSaltUniqueVariableName
  const payload = config.staticryptEncryptedMsgUniqueVariableName

  const good = await codec.decode(payload, await cryptoEngine.hashPassword(password, salt), salt, 0, password)
  check('STATICRYPT_PASSWORD decrypts the page', good.success)

  const wrong = await codec.decode(payload, await cryptoEngine.hashPassword(`${password}-wrong`, salt), salt, 0, password)
  check('a wrong password is rejected', !wrong.success)
} else {
  console.log('SKIP  decryption round-trip (STATICRYPT_PASSWORD not set)')
}

// ── The search index never sees the protected content ───────────────────────
const fragmentDir = 'dist/pagefind/fragment'
const fragments = readdirSync(fragmentDir).map((file) => decode(readFileSync(`${fragmentDir}/${file}`)))
check('no plaintext in the search index', !fragments.some((text) => SECRET_MARKERS.some((m) => text.includes(m))))
check('protected page is not indexed', !fragments.some((text) => text.includes('"/docs/dev/secret/"')))
check('content pages are indexed', fragments.filter((text) => /"url":"\/docs\//.test(text)).length >= 3)

if (failures.length > 0) {
  console.error(`\n${failures.length} build assertion(s) failed.`)
  process.exit(1)
}
console.log('\nAll build assertions passed.')
