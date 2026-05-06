export interface DocEntry {
  title: string
  description?: string
  slug: string
}

export interface SidebarGroup {
  text: string
  items: { text: string; link: string }[]
}

export const docs: DocEntry[] = [
  {
    title: '快速开始',
    description: '欢迎使用 Markdown Wiki，本指南将帮助你快速上手。',
    slug: 'getting-started',
  },
  {
    title: '架构设计',
    description: '了解项目技术栈与整体架构。',
    slug: 'dev/architecture',
  },
  {
    title: '接口说明',
    description: '站点 URL 结构与配置接口说明。',
    slug: 'dev/api-reference',
  },
]

export const sidebar: SidebarGroup[] = [
  {
    text: '起步',
    items: [{ text: '快速开始', link: '/docs/getting-started' }],
  },
  {
    text: '开发指南',
    items: [
      { text: '架构设计', link: '/docs/dev/architecture' },
      { text: '接口说明', link: '/docs/dev/api-reference' },
    ],
  },
]
