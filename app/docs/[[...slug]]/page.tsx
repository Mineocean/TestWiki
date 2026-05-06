import { compileMDX } from 'next-mdx-remote/rsc'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { docs } from '@/lib/source'
import { components } from '@/components/mdx-components'
import remarkGfm from 'remark-gfm'

interface DocPageProps {
  params: Promise<{ slug?: string[] }>
}

export function generateStaticParams() {
  return docs.map((doc) => ({ slug: doc.slug.split('/') }))
}

export async function generateMetadata({
  params,
}: DocPageProps): Promise<Metadata> {
  const { slug } = await params
  const docSlug = slug?.join('/') ?? ''
  const doc = docs.find((d) => d.slug === docSlug)

  return {
    title: doc?.title ? `${doc.title} | Markdown Wiki` : '文档',
    description: doc?.description,
  }
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params
  const docSlug = slug?.join('/') ?? ''
  const doc = docs.find((d) => d.slug === docSlug)

  if (!doc) notFound()

  const filePath = join(process.cwd(), 'content', `${doc.slug}.mdx`)
  if (!existsSync(filePath)) notFound()

  const sourceText = readFileSync(filePath, 'utf-8')
  const { content } = await compileMDX({
    source: sourceText,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
      },
    },
    components,
  })

  return (
    <>
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-neutral-900">
        {doc.title}
      </h1>
      {doc.description && (
        <p className="mb-6 text-lg text-neutral-500">{doc.description}</p>
      )}
      {content}
    </>
  )
}
