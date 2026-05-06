# Sage

基于 Astro 的轻量级文档站点，支持纯静态部署。内置 Pagefind 全文搜索。

## 技术栈

- [Astro](https://astro.build/) — 零 JS 默认的静态站点框架
- [MDX](https://mdxjs.com/) — Markdown + 组件
- [Pagefind](https://pagefind.app/) — 静态搜索

## 本地开发

```bash
npm install
npm run dev        # → http://localhost:4321
```

## 构建

```bash
npm run build      # 构建 + 搜索索引 → dist/
```

## 项目结构

```
src/
├── content/docs/       # 文档内容（丢 .mdx 文件即可）
│   ├── _meta.ts        # 侧边栏配置
│   ├── getting-started.mdx
│   └── dev/
│       ├── architecture.mdx
│       └── api-reference.mdx
├── pages/
│   ├── index.astro     # 首页
│   ├── 404.astro       # 404
│   └── docs/
│       └── [...slug].astro  # 文档路由
└── layouts/
    └── DocsLayout.astro
```

## 添加新文档

1. 在 `src/content/docs/` 创建 `.mdx` 文件
2. 在 `src/content/docs/_meta.ts` 加一行配置
3. 完成。构建后自动生效

## 部署

纯静态输出 `dist/`：

- **Vercel**: 自动检测 Astro
- **Netlify**: Build `npm run build`, Publish `dist`
- **Cloudflare Pages**: Build `npm run build`, Output `dist`
