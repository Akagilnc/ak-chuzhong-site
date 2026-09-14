# ak-chuzhong-site

初中生讲解页站点，挂在 `study.akbot.top`。

> **和 `ak-study-site` 的关系**：`study.akbot.top` 原先挂的是「说人话」那个站
> （源在 `~/WorkSpace/ak-study-site`）。2026-09-14 换成本站，说人话整个撤下、
> 源文件原样留着，等定了新域名再挂回去。
>
> 两个站**共用同一个 Cloudflare Pages 项目 `ak-study`** —— 因为自定义域名绑在这个项目上，
> 而现有 API token 改不了 DNS（见下）。谁往 `ak-study` 发布，`study.akbot.top` 就是谁。
> 说人话的旧版本还在 Pages 部署历史里，面板上可以回滚。

## 目录

```
ak-chuzhong-site/
└── dist/               ← 发布目录，里面放什么就上线什么
    ├── index.html      首页目录（平铺列表）
    ├── base.css        全站配色 / 纸张底纹 / 基础排版
    └── <slug>/
        └── index.html  一道题一页
```

配色和排版的**唯一真源是 `base.css`**。页面里只写自己那一页特有的样式，
不要再抄一份 `:root` 变量——抄了就会和 base.css 打架。

## 加一页

1. 页面存成 `dist/<slug>/index.html`，slug 用短英文（`cube` 这种）。
2. 头部固定这几行（**`<meta charset="utf-8">` 少了中文直接乱码**）：

   ```html
   <!doctype html>
   <html lang="zh">
   <head>
   <meta charset="utf-8">
   <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
   <title>页面名</title>
   <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Serif:wght@500;600&display=swap">
   <link rel="stylesheet" href="../base.css">
   <style>/* 只写这一页特有的 */</style>
   </head>
   <body>
   ```
3. 正文第一行放回首页的链接：`<p class="back"><a href="../">← 初中图解</a></p>`
4. 在 `dist/index.html` 的 `<ul class="toc">` 里加一条（编号接着排）：

   ```html
   <li><a href="<slug>/">
     <span class="num">02</span>
     <span class="t">标题</span>
     <span class="tag">科目 · 知识点</span>
     <p class="desc">一句话说清这页能干什么。</p>
   </a></li>
   ```
5. 部署。

## 部署

```bash
cd ~/WorkSpace/ak-chuzhong-site
source ~/.zshrc && npx wrangler pages deploy ./dist --project-name ak-study --branch main --commit-dirty=true
```

`source ~/.zshrc` 不能省：`CLOUDFLARE_API_TOKEN` 在 zshrc 里导出，非交互 subshell 默认不 load。

- Pages 项目：`ak-study`
- 预览域名：https://ak-study.pages.dev
- 正式域名：https://study.akbot.top

> 部署后头几秒边缘节点可能还是旧的：新路径会被 fallback 成首页（HTTP 200 + 首页内容），
> **不是没传上去**。等十几秒再验，别急着重发。

## 别让小孩抄到答案

这是本站的硬要求，做题页必须守住三条：

1. **答案 base64 编码**，源码里不留明文。查看源代码抄不到；判了才 `dec()` 解开。
   要改答案先解：`python3 -c "import base64;print(base64.b64decode('<串>').decode())"`
2. **不给「一键看答案」的按钮。** 一张一张判，点下去才出那一张的对错和解释。
3. **`[hidden]{display:none !important}` 必须写在页面自己的 `<style>` 里**，不能只放 base.css。
   理由：外链 CSS 会被浏览器缓存（zone 规则 `max-age=14400`，我们改不了），
   拿到旧文件时 `.finish{display:flex}` 会顶掉 `hidden` 属性 —— 答案就那么露出来了。
   **样式旧一点无所谓，答案露出来不行。**

`dist/_headers` 里加了 `must-revalidate`，但 zone 规则仍会把 `max-age` 改成 14400，
所以改过 `base.css` 之后**要把页面里的 `base.css?v=N` 版本号加一**。

## 从 Claude Artifact 搬页面过来

Artifact 宿主会自动补 `<!doctype>` / `<head>` / `charset` / 基础 reset（含上面那条 `[hidden]`），
**自托管全得自己带**。照「加一页」第 2 步补齐外壳，别漏。

## Token 权限现状

`~/.zshrc` 里的 token 权限（2026-08-24 实测，2026-09-14 复核 Pages 部分仍可用）：

| 能力 | 状态 |
|---|---|
| Pages 项目读写 | ✅ |
| Zone 读 | ✅ |
| DNS 读 / 写 | ❌ 403 |

所以**换域名、绑新域名都得在 Cloudflare Dashboard 手动做**，或者给 token 补上
`Zone → DNS → Edit`（限 akbot.top）。这也是本站沿用 `ak-study` 项目的原因。
