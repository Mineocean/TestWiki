# Sage

Sage 是基于 Astro 7 和 MDX 的静态文档站点，提供 Pagefind 全文搜索、可折叠的文档导航、阅读目录和亮暗主题。界面采用 StyleKit 的 Notion 风格，站点标志与网页图标共用 `public/sage.svg`。 [StyleKit 设计规范](https://www.stylekit.top/api/design/notion-style/design.md?locale=zh)

## 本地开发

使用 `.node-version` 中指定的 Node.js 24 版本，在仓库根目录运行以下命令。

```powershell
npm ci
npm run dev
```

开发服务默认访问 `http://localhost:4321/`。搜索索引和密码保护由生产构建生成。验证这两个功能时，请先在本地 `.env` 中设置 `STATICRYPT_PASSWORD`，然后构建并预览。示例值只用于本地测试。

```dotenv
STATICRYPT_PASSWORD=replace-with-a-long-local-password
```

```powershell
npm run typecheck
npm test
npm run build
npm run preview
```

`npm run build` 检查密码配置，生成静态页面，用 StatiCrypt 替换受保护页面，再生成 Pagefind 索引。最后检查正确密码能否解密、错误密码是否被拒绝，以及搜索索引是否排除了受保护页面。发布目录为 `dist/`。

## 添加文档

1. 在 `src/content/docs/` 中创建 `.mdx` 文件，可使用子目录。Frontmatter 支持 `title` 和可选的 `description`。
2. 在 `src/content/docs/_meta.ts` 中添加标题和文档路径。路径相对于 `src/content/docs/`，省略扩展名。导航及首页文档列表从此文件读取。
3. 重新构建。文档地址由文件路径决定，例如 `src/content/docs/dev/api-reference.mdx` 对应 `/docs/dev/api-reference`。

共享样式与主题脚本位于 `public/sage.css` 和 `public/theme.js`。文档布局位于 `src/layouts/DocsLayout.astro`，密码页模板位于 `src/staticrypt-template.html`。

`/docs/dev/secret` 使用客户端密码保护。MDX 源文件在仓库中以明文保存，开发服务也会渲染该源文件。请将真正的凭据和私密资料保存在具备访问控制的系统中。

## 从 Vercel 迁移到 Cloudflare Pages

### 1. 创建 Pages 项目

先让 Vercel 继续服务现有域名。将待部署版本推送到 GitHub 或 GitLab.com，在 Cloudflare 控制台打开 **Workers & Pages → Create application → Pages → Import an existing Git repository**，选择仓库并填写：

| 设置 | 值 |
| --- | --- |
| 生产分支 | `master`，或实际用于生产的分支 |
| 框架预设 | Astro |
| 根目录 | 仓库根目录，留空即可 |
| 构建命令 | `npm run build` |
| 构建输出目录 | `dist` |
| Node.js | 使用 `.node-version`。如需在控制台指定，令 `NODE_VERSION` 与文件内容一致 |
| 构建环境变量 | `STATICRYPT_PASSWORD` |

在 Pages 项目的环境变量设置中，将 `STATICRYPT_PASSWORD` 保存为加密变量。生产环境使用现有 Vercel 密码可保留读者的使用方式。启用预览构建时，给预览环境设置独立的测试密码。保存后启动构建。此站点直接发布静态产物，无需 Cloudflare Astro 适配器或 Pages Functions。 [Pages Git 集成](https://developers.cloudflare.com/pages/get-started/git-integration/) · [构建环境](https://developers.cloudflare.com/pages/configuration/build-image/) · [Pages 环境变量与密钥](https://developers.cloudflare.com/pages/functions/bindings/)

自托管 GitLab 或其他 Git 服务可使用 Direct Upload。在本地或 CI 用对应环境的 `STATICRYPT_PASSWORD` 运行 `npm ci` 和 `npm run build`，确认成功后上传 `dist/`。以下命令中的项目名称需要换成你选定的名称。项目只需创建一次，后续发布仅执行最后一行。 [Direct Upload 指南](https://developers.cloudflare.com/pages/get-started/direct-upload/)

```powershell
$project = 'sage-docs'
$branch = 'master'
npx wrangler login
npx wrangler pages project create $project --production-branch $branch
npx wrangler pages deploy dist --project-name $project --branch $branch
```

### 2. 验证 Pages 地址

在控制台提供的 `*.pages.dev` 地址上，用无痕窗口检查：

- 打开首页、`/docs/getting-started` 和 `/docs/dev/api-reference`，确认页面、标志和导航正常。访问一个不存在的路径，确认返回自定义 404 和 HTTP 404。
- 打开搜索，输入「架构」，确认可以进入架构设计页。搜索受保护文档中的独有内容，确认搜索无结果。
- 直接打开 `/docs/dev/secret`，确认错误密码被拒绝、正确密码能打开正文。

如果构建提示缺少 `STATICRYPT_PASSWORD`，检查失败的部署究竟属于生产还是预览环境，补充相应变量后重新构建。 [Pages 静态文件与 404](https://developers.cloudflare.com/pages/configuration/serving-pages/)

### 3. 切换域名

1. 保存当前指向 Vercel 的 DNS 记录。若准备迁移根域名的 DNS 托管，先在 Cloudflare 核对原有记录，尤其是邮箱使用的 MX、TXT 及其他子域名记录。
2. 在 Pages 项目中打开 **Custom domains → Set up a custom domain**，添加原域名。根域名（例如 `example.com`）需要将 DNS 区域加入当前 Cloudflare 账户，并按 Cloudflare 提示在注册商处更新域名服务器。子域名（例如 `docs.example.com`）可继续使用原 DNS 提供商，在 Pages 中完成域名关联后，将该子域名的 CNAME 改为 Pages 项目给出的 `*.pages.dev` 地址。已使用 Cloudflare DNS 时，按面板提示替换对应主机名的旧记录。
3. 等待域名和 HTTPS 状态变为可用，再通过正式域名复查上一步。也检查 Vercel 配置中使用过的重定向，以及根域名与 `www` 的访问方式。 [Cloudflare 自定义域名](https://developers.cloudflare.com/pages/configuration/custom-domains/) · [从 Vercel 迁移](https://developers.cloudflare.com/pages/migrations/migrating-from-vercel/)

### 4. 回退与停用 Vercel

若 Cloudflare 部署版本出错，在 Pages 的 **Deployments** 中将上一版成功的生产部署设为当前版本。若需要把流量切回 Vercel，在当前权威 DNS 服务商恢复之前指向 Vercel 的记录，并确认该域名在 Vercel 仍处于可用状态。保留 Vercel 项目，待正式域名稳定、确认无需回退后再停用旧部署。 [Cloudflare Pages 回退](https://developers.cloudflare.com/pages/configuration/rollbacks/)

## 许可

[MIT](./LICENSE)
