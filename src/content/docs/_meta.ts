export interface MetaItem {
  label: string
  slug: string
}

export interface MetaGroup {
  label: string
  slug?: string
  items: MetaItem[]
}

export type MetaEntry = MetaItem | MetaGroup

const meta: MetaEntry[] = [
  { label: '快速开始', slug: 'getting-started' },
  {
    label: '开发指南',
    slug: 'dev',
    items: [
      { label: '架构设计', slug: 'dev/architecture' },
      { label: '接口说明', slug: 'dev/api-reference' },
      { label: '机密文档', slug: 'dev/secret' },
    ],
  },
]

export default meta