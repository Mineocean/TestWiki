# Sage

基于 Astro 6 的轻量级文档站点，纯静态部署。内置 Pagefind 全文搜索，完整暗黑模式支持。

<p align="center">
  <img src="https://img.shields.io/badge/Astro-6.x-7c3aed?logo=astro" />
  <img src="https://img.shields.io/badge/tested-vitest-7c3aed" />
  <img src="https://img.shields.io/badge/dark_mode-CSS_custom_properties-7c3aed" />
</p>

## 特性

- **静态优先** — Astro 构建为纯静态 HTML+CSS；交互（主题、搜索、侧栏）只用少量原生内联脚本，无前端框架
- **暗黑模式** — 40 个 CSS 自定义属性，0.3s 平滑过渡，系统偏好自动检测
- **全文搜索** — Pagefind 离线索引，Ctrl+K 呼出
- **可折叠侧边栏** — 移动端自适应，滚动高亮目录
- **页面级加密** — StatiCrypt 客户端 AES 加密单个文档
- **纯静态输出** — `dist/` 目录可直接部署

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | [Astro 6](https://astro.build/) |
| 内容 | MDX（`import.meta.glob` 路由，见下文） |
| 搜索 | [Pagefind](https://pagefind.app/) |
| 加密 | [StatiCrypt](https://github.com/robinmoisson/staticrypt) |
| 测试 | [Vitest](https://vitest.dev/) |
| 字体 | [Inter](https://rsms.me/inter/) |

## 项目结构

```
src/
├── components/
│   ├── SearchDialog.astro   # 搜索对话框（Pagefind 懒加载）
│   └── ThemeInit.astro      # 主题初始化 + [data-theme-toggle] 绑定
├── content/docs/            # 文档内容
│   ├── _meta.ts             # 侧边栏配置（仅顶层这一个）
│   ├── getting-started.mdx
│   └── dev/
│       ├── architecture.mdx
│       ├── api-reference.mdx
│       └── secret.mdx       # 加密文档
├── layouts/
│   ├── BaseLayout.astro     # 全站外壳（head / 主题 / 搜索 / 浮动按钮）
│   └── DocsLayout.astro     # 文档页布局（复用 BaseLayout）
├── lib/
│   ├── sidebar.ts           # 侧边栏渲染逻辑
│   └── sidebar.test.ts      # 侧边栏单元测试
├── pages/
│   ├── index.astro          # 首页
│   ├── 404.astro            # 404
│   └── docs/
│       └── [...slug].astro  # 文档路由
├── styles/
│   └── tokens.css           # 设计 Token（亮色/暗色）
└── staticrypt-template.html # 加密页模板
scripts/
└── encrypt.mjs              # 构建期加密步骤
```

## 本地开发

```bash
npm install
npm run dev        # → http://localhost:4321
```

`astro dev` 不会生成 Pagefind 索引，因此开发服务器里搜索对话框会提示"搜索索引不可用"；要试搜索请先 `npm run build` 再预览 `dist/`。

## 命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建 → 加密 → 搜索索引 |
| `npm run encrypt` | 只重跑加密（需要已存在 `dist/`） |
| `npm run typecheck` | `astro check` 类型检查 |
| `npm test` | 运行 Vitest 测试 |
| `npm run test:watch` | 测试监视模式 |

## 构建

```bash
# 密码必须通过环境变量提供，仓库里不保存明文
echo "STATICRYPT_PASSWORD='your-long-password'" > .env   # .env 已被 gitignore
npm run build
```

构建流程：`astro build` → `node scripts/encrypt.mjs`（StatiCrypt 加密 `docs/dev/secret/`）→ `pagefind --site dist`。

顺序很关键：**加密必须在生成搜索索引之前**，否则 Pagefind 会把待加密页面的明文写进索引分片。加密后的页面没有 `data-pagefind-body` 标记，因此不会被索引。

## 添加新文档

1. 在 `src/content/docs/` 创建 `.mdx` 文件（可以放在子目录里）
2. 在 `src/content/docs/_meta.ts` 加一行配置
3. 构建后自动生效

```ts
// _meta.ts
{ label: '新文档', slug: 'new-doc' }                       // 单页
{ label: '开发指南', slug: 'dev', items: [ /* ... */ ] }    // 可折叠分组
```

路由由 `src/pages/docs/[...slug].astro` 里的 `import.meta.glob` 生成，slug 就是相对 `src/content/docs/` 的路径（不含扩展名）。`_meta.ts` 只影响侧边栏，不影响路由——没有登记到侧边栏的文档仍然可以访问。

## 暗黑模式

设计 Token 集中在 `src/styles/tokens.css`，共 40 个 CSS 自定义属性，亮色/暗色各一套。

- 首屏前由 `ThemeInit.astro` 的 inline 脚本写入 `<html data-theme>`，避免闪烁
- 任何带 `data-theme-toggle` 的按钮都会自动接入切换逻辑，图标用 `.theme-icon-sun` / `.theme-icon-moon` 由 CSS 控制显隐
- 用户选择存入 `localStorage`

## 加密文档

`src/content/docs/dev/secret.mdx` 在构建时被 StatiCrypt 替换为密码页，密码来自 `STATICRYPT_PASSWORD`。

需要清楚它的边界：这是**客户端加密**，只能挡住直接访问产物的读者。`npm run dev` 下该页仍是明文（加密是构建期步骤），要验证加密效果请构建后预览 `dist/`。`src/content/docs/dev/secret.mdx` 本身是仓库里的明文，索引也已排除该页，但不要把真正的密钥放进这个仓库。`git log` 里历史上出现过演示密码，投入生产前请轮换密码（必要时重写历史）。

## 部署

纯静态输出 `dist/`：

- **Vercel**: 自动检测 Astro（记得配置 `STATICRYPT_PASSWORD` 环境变量）
- **Netlify**: Build `npm run build`, Publish `dist`
- **Cloudflare Pages**: Build `npm run build`, Output `dist`

## 许可

[MIT](./LICENSE)
