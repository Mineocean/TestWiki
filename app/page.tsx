import Link from 'next/link'
import { BookOpen, ChevronRight, Zap, Search, Rocket, FileText } from 'lucide-react'

const features = [
  {
    icon: FileText,
    title: 'Markdown 编写',
    description: '所有文档使用标准 Markdown 语法编写，支持标题、列表、代码块、表格等常见格式。',
  },
  {
    icon: Zap,
    title: '静态生成',
    description: '构建时将所有文档预渲染为静态 HTML，首屏加载极快，SEO 友好。',
  },
  {
    icon: Search,
    title: '全文可搜索',
    description: '清晰的侧边栏导航与层级结构，助你快速定位目标文档。',
  },
  {
    icon: Rocket,
    title: '一键部署',
    description: '输出纯静态文件，可直接部署到 Vercel、Netlify、Cloudflare Pages 等平台。',
  },
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <section className="relative flex flex-col items-center justify-center px-4 pt-24 pb-16 sm:pt-32 sm:pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.08),transparent_50%)]" />
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <h1 className="bg-gradient-to-b from-neutral-900 via-neutral-700 to-neutral-500 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl">
            Markdown Wiki
          </h1>
          <p className="mt-4 text-lg text-neutral-500">
            轻量级文档站点 · 纯静态 · 零运行时
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/docs/getting-started"
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
            >
              快速开始
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href="/docs/dev/architecture"
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-6 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              开发指南
              <BookOpen className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-100 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid gap-6 sm:grid-cols-2">
            {features.map((feature) => (
              <div key={feature.title} className="card group">
                <feature.icon className="mb-3 h-8 w-8 text-purple-600/80" />
                <h3 className="text-lg font-semibold text-neutral-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mt-auto border-t border-neutral-100 py-8 text-center text-sm text-neutral-400">
        <p>Powered by Next.js · Deploy anywhere</p>
      </footer>
    </div>
  )
}
