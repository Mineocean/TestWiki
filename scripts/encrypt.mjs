import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, renameSync, rmSync, rmdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)

if (!process.env.STATICRYPT_PASSWORD) {
  try {
    process.loadEnvFile()
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
}

if (!process.env.STATICRYPT_PASSWORD) {
  throw new Error('Set STATICRYPT_PASSWORD in the build environment or in a local .env file.')
}

if (!process.argv.includes('--check-password')) {
  const target = 'dist/docs/dev/secret/index.html'
  const template = 'src/staticrypt-template.html'

  if (!existsSync(target)) throw new Error('Run astro build before encrypting the document.')
  if (readFileSync(target, 'utf8').includes('staticryptInitiator.init(')) {
    throw new Error('The document is already encrypted. Run npm run build to regenerate it.')
  }

  const staging = mkdtempSync(join(dirname(target), '.encrypt-'))
  const encrypted = join(staging, 'index.html')
  try {
    const cli = require.resolve('staticrypt/cli/index.js')
    const result = spawnSync(process.execPath, [cli, target, '-d', staging, '--short', '-t', template], {
      stdio: 'inherit',
    })
    if (result.error) throw result.error
    if (result.status !== 0 || !existsSync(encrypted)) throw new Error('StatiCrypt failed to encrypt the document.')
    renameSync(encrypted, target)
  } catch (error) {
    rmSync(target, { force: true })
    throw error
  } finally {
    rmSync(encrypted, { force: true })
    rmdirSync(staging)
  }
}
