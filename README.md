# Sage

基于 Astro 和 MDX 的静态文档站点。

## 功能

- 使用 MDX 编写 Markdown 文档，支持折叠导航和页面目录。
- 使用 Pagefind 全文搜索，可按 Ctrl+K 或 ⌘K 打开。
- 支持亮色和暗色主题，以及示例文档的浏览器端密码保护。

## 本地开发

使用 [`.node-version`](./.node-version) 指定的 Node.js 版本，在仓库根目录运行以下命令。

```powershell
npm ci
npm run dev
```

开发服务默认地址为 `http://localhost:4321/`。

## 构建与预览

在仓库根目录的 `.env` 中设置 `STATICRYPT_PASSWORD`，也可以通过构建环境变量提供。

```dotenv
STATICRYPT_PASSWORD=replace-with-your-password
```

```powershell
npm run build
npm run preview
```

构建会加密受保护的示例文档、生成搜索索引并检查产物。静态发布目录为 `dist/`。

[从 Vercel 迁移到 Cloudflare Pages](./docs/cloudflare-pages-migration.md)

## 许可

[MIT](./LICENSE)
