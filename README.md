# Sage

基于 Astro 6 的轻量级文档站点，纯静态部署。内置 Pagefind 全文搜索，完整暗黑模式支持。

<p align="center">
  <img src="https://img.shields.io/badge/Astro-6.x-7c3aed?logo=astro" />
  <img src="https://img.shields.io/badge/tested-vitest-7c3aed" />
  <img src="https://img.shields.io/badge/dark_mode-CSS_custom_properties-7c3aed" />
</p>

## 特性

- **零 JS 默认** — Astro 输出纯静态 HTML+CSS
- **暗黑模式** — 28 个 CSS 自定义属性，0.3s 平滑过渡，系统偏好自动检测
- **全文搜索** — Pagefind 离线索引，Ctrl+K 呼出
- **可折叠侧边栏** — 移动端自适应，滚动高亮目录
- **纯静态输出** — `dist/` 目录可直接部署

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | [Astro 6](https://astro.build/) |
| 内容 | MDX (Content Collections) |
| 搜索 | [Pagefind](https://pagefind.app/) |
| 加密 | [StatiCrypt](https://github.com/robinmoisson/staticrypt) |
| 测试 | [Vitest](https://vitest.dev/) |
| 字体 | [Inter](https://rsms.me/inter/) |

## 项目结构

```
src/
├── components/
│   └── SearchDialog.astro   # 搜索对话框组件
├── content/docs/            # 文档内容
│   ├── _meta.ts             # 侧边栏配置
│   ├── getting-started.mdx
│   └── dev/
│       ├── architecture.mdx
│       ├── api-reference.mdx
│       └── secret.mdx       # 加密文档
├── layouts/
│   └── DocsLayout.astro     # 文档页布局
├── lib/
│   ├── sidebar.ts           # 侧边栏渲染逻辑
│   └── sidebar.test.ts      # 侧边栏单元测试
├── pages/
│   ├── index.astro          # 首页
│   ├── 404.astro            # 404
│   └── docs/
│       └── [...slug].astro  # 文档路由
└── styles/
    └── tokens.css           # 设计 Token（亮色/暗色）
```

## 本地开发

```bash
npm install
npm run dev        # → http://localhost:4321
```

## 命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建 + 搜索索引 + 文档加密 |
| `npm test` | 运行 Vitest 测试 |
| `npm run test:watch` | 测试监视模式 |

## 构建

```bash
npm run build
```

构建流程：`astro build` → `pagefind` 索引 → `staticrypt` 加密 `docs/dev/secret/`

## 添加新文档

1. 在 `src/content/docs/` 创建 `.mdx` 文件
2. 在 `src/content/docs/_meta.ts` 加一行配置
3. 构建后自动生效

```ts
// _meta.ts
{ label: '新文档', slug: 'new-doc' }
```

## 暗黑模式

设计 Token 集中在 `src/styles/tokens.css`，共 28 个 CSS 自定义属性。切换主题通过 `<html data-theme="dark">`，系统偏好自动检测，用户选择存入 `localStorage`。

所有页面共享同一套 Token，无需重复定义。

## 部署

纯静态输出 `dist/`：

- **Vercel**: 自动检测 Astro
- **Netlify**: Build `npm run build`, Publish `dist`
- **Cloudflare Pages**: Build `npm run build`, Output `dist`
