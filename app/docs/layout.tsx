import { Navbar } from '@/components/navbar'
import { Sidebar } from '@/components/sidebar'
import { Toc } from '@/components/toc'

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto flex max-w-8xl">
        <Sidebar />
        <main className="min-w-0 flex-1 px-6 py-8 md:px-10">
          <article className="prose prose-neutral max-w-none">{children}</article>
        </main>
        <Toc />
      </div>
    </div>
  )
}
