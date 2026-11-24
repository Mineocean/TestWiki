import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, renameSync, rmSync, rmdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { collectDocs, escapeHtml } from './docs-manifest.mjs'

const require = createRequire(import.meta.url)
const checkOnly = process.argv.includes('--check-password')
const protectedDocs = collectDocs().filter((doc) => doc.protected)

if (protectedDocs.length === 0) {
  if (!checkOnly) {
    console.log('No protected documents found; skipping encryption.')
  }
  process.exit(0)
}

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

if (!checkOnly) {
  const template = 'src/staticrypt-template.html'
  const cli = require.resolve('staticrypt/cli/index.js')

  for (const doc of protectedDocs) {
    const target = doc.distHtml
    if (!existsSync(target)) {
      throw new Error(`Run astro build before encrypting ${doc.slug} (${target}).`)
    }
    if (readFileSync(target, 'utf8').includes('staticryptInitiator.init(')) {
      throw new Error(`The document ${doc.slug} is already encrypted. Run npm run build to regenerate it.`)
    }

    const staging = mkdtempSync(join(dirname(target), '.encrypt-'))
    const encrypted = join(staging, 'index.html')
    const title = escapeHtml(doc.title || doc.slug)
    const instructions = escapeHtml(doc.description || '此文档受密码保护。')

    try {
      const result = spawnSync(
        process.execPath,
        [
          cli,
          target,
          '-d',
          staging,
          '--short',
          '-t',
          template,
          '--template-title',
          title,
          '--template-instructions',
          instructions,
        ],
        { stdio: 'inherit' },
      )
      if (result.error) throw result.error
      if (result.status !== 0 || !existsSync(encrypted)) {
        throw new Error(`StatiCrypt failed to encrypt ${doc.slug}.`)
      }
      renameSync(encrypted, target)
    } catch (error) {
      rmSync(target, { force: true })
      throw error
    } finally {
      rmSync(encrypted, { force: true })
      rmdirSync(staging)
    }
  }
}
