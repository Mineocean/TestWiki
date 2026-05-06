# Markdown Wiki

基于 Next.js + MDX 的轻量级文档站点，支持纯静态部署。

## 技术栈

- [Next.js](https://nextjs.org/) — React 全栈框架（App Router）
- [MDX](https://mdxjs.com/) — Markdown + React 组件
- [Tailwind CSS](https://tailwindcss.com/) — 原子化 CSS 框架

## 本地开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

产物在 `out/` 目录，为纯静态文件，可部署到任意静态托管平台。

## 部署

项目输出纯静态文件，可一键部署到：

- **Vercel**: Framework Preset 自动检测 Next.js
- **Netlify**: Build `npm run build`, Publish `out`
- **Cloudflare Pages**: Build `npm run build`, Output `out`

## 项目结构

```
├── app/                 # Next.js App Router
│   ├── layout.tsx       # 根布局
│   ├── page.tsx         # 首页
│   └── docs/            # 文档路由
├── components/          # 共享组件
├── content/             # MDX 文档内容
├── lib/
│   └── source.ts        # 内容源配置
└── tailwind.config.ts   # Tailwind 配置
```

## 添加新文档

1. 在 `content/` 目录创建 `.mdx` 文件
2. 在 `lib/source.ts` 中注册文档路由和侧边栏
3. 访问 `/docs/{slug}` 查看
