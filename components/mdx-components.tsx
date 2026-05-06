import type { MDXComponents } from 'mdx/types'
import Link from 'next/link'

export const components: MDXComponents = {
  a: ({ href, ...props }) => {
    if (href?.startsWith('http')) {
      return <a href={href} target="_blank" rel="noreferrer" {...props} />
    }
    return <Link href={href ?? '/'} {...props} />
  },

  pre: (props) => (
    <pre className="overflow-x-auto rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm" {...props} />
  ),

  table: ({ children, ...props }) => (
    <div className="overflow-x-auto rounded-lg border border-neutral-200">
      <table className="w-full text-sm" {...props}>
        {children}
      </table>
    </div>
  ),

  th: (props) => (
    <th className="border-b border-neutral-200 bg-neutral-50 px-4 py-2 text-left font-semibold" {...props} />
  ),

  td: (props) => (
    <td className="border-b border-neutral-100 px-4 py-2" {...props} />
  ),

  h2: (props) => (
    <h2 className="mb-3 mt-10 scroll-mt-20 text-2xl font-bold tracking-tight" {...props} />
  ),

  h3: (props) => (
    <h3 className="mb-2 mt-8 scroll-mt-20 text-xl font-semibold tracking-tight" {...props} />
  ),

  ul: (props) => (
    <ul className="my-4 list-disc space-y-1.5 pl-6" {...props} />
  ),

  ol: (props) => (
    <ol className="my-4 list-decimal space-y-1.5 pl-6" {...props} />
  ),

  blockquote: (props) => (
    <blockquote className="my-4 border-l-4 border-purple-300 bg-purple-50/50 py-1 pl-4 text-neutral-700" {...props} />
  ),

  hr: (props) => <hr className="my-8 border-neutral-200" {...props} />,

  img: ({ alt, ...props }) => (
    <img alt={alt ?? ''} className="rounded-lg" {...props} />
  ),
}
