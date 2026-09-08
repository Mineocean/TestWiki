// Encrypt the protected page with StatiCrypt (client-side AES).
//
// The password is never stored in the repository: it comes from the
// STATICRYPT_PASSWORD environment variable (or a local, gitignored .env file,
// which staticrypt loads itself).
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

// A gitignored .env is enough; CI can also pass a real environment variable.
if (!process.env.STATICRYPT_PASSWORD) {
  try {
    process.loadEnvFile('.env')
  } catch {
    // no .env — handled by the check below
  }
}

const target = 'dist/docs/dev/secret/index.html'
const outputDirectory = 'dist/docs/dev/secret/'
const template = 'src/staticrypt-template.html'

if (!process.env.STATICRYPT_PASSWORD) {
  console.error(
    '[encrypt] STATICRYPT_PASSWORD is not set.\n' +
      '          Put it in a local .env file (gitignored) or export it for one command:\n' +
      "          STATICRYPT_PASSWORD='your-long-password' npm run build",
  )
  process.exit(1)
}

if (!existsSync(target)) {
  console.error(`[encrypt] ${target} not found — run \`astro build\` first.`)
  process.exit(1)
}

if (!existsSync(template)) {
  console.error(`[encrypt] template ${template} not found.`)
  process.exit(1)
}

const cli = require.resolve('staticrypt/cli/index.js')

const result = spawnSync(
  process.execPath,
  [cli, target, '-d', outputDirectory, '--short', '-t', template],
  { stdio: 'inherit' },
)

if (result.error) {
  console.error('[encrypt] failed to run staticrypt:', result.error.message)
  process.exit(1)
}

process.exit(result.status ?? 1)
