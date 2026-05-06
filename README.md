# Markdown Wiki

基于 Astro 的轻量级 Markdown 文档站点，支持纯静态部署。

## 技术栈

- [Astro](https://astro.build/) — 零 JS 默认的静态站点框架
- [MDX](https://mdxjs.com/) — Markdown + 组件

## 本地开发

```bash
npm install
npm run dev        # 启动开发服务器 → http://localhost:4321
```

## 构建 & 预览

```bash
npm run build      # 构建到 dist/
npm run preview    # 预览构建产物 → http://localhost:4321
```

## 项目结构

```
src/
├── pages/              # 页面（文件即路由）
│   ├── index.astro     # 首页
│   ├── *.mdx           # 文档页面
│   └── dev/
├── layouts/            # 布局组件
│   └── DocsLayout.astro
└── components/         # 预留
astro.config.mjs        # Astro 配置
```

## 添加新文档

1. 在 `src/pages/` 创建 `.mdx` 文件
2. 添加 frontmatter: `layout: ../layouts/DocsLayout.astro`
3. 在侧边栏的 `DocsLayout.astro` 中添加导航链接
4. 直接访问对应路径

## 部署

输出纯静态文件到 `dist/`，可直接部署：

- **Vercel**: 自动检测 Astro
- **Netlify**: Build `npm run build`, Publish `dist`
- **Cloudflare Pages**: Build `npm run build`, Output `dist`
- **任意静态服务器**: 将 `dist/` 目录内容上传即可
