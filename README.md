# ak-chuzhong-site

初中数学的图解讲解页，一道题一页。图能拖能点，自己判完才给答案。

线上：<https://study.akbot.top>

## 结构

```
dist/                   发布目录，里面放什么就上线什么
├── index.html          首页目录
├── base.css            配色 / 底纹 / 基础排版
├── _headers            缓存策略
└── <slug>/index.html   一道题一页
```

## 加一页

1. 页面写到 `dist/<slug>/index.html`，slug 用短英文。
2. 头部照抄：

   ```html
   <!doctype html>
   <html lang="zh">
   <head>
   <meta charset="utf-8">
   <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
   <title>页面名</title>
   <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Serif:wght@500;600&display=swap">
   <link rel="stylesheet" href="../base.css?v=2">
   <style>[hidden]{display:none !important}</style>
   </head>
   <body>
   ```
3. 正文第一行放 `<p class="back"><a href="../">← 初中图解</a></p>`。
4. 在首页 `<ul class="toc">` 末尾加一条，编号接着排：

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
source ~/.zshrc && npx wrangler pages deploy ./dist --project-name ak-study --branch main --commit-dirty=true
```

`source ~/.zshrc` 不能省，Cloudflare 的 token 在里面导出，非交互 subshell 不会自动 load。

## 约定

- **配色和排版只在 `base.css` 里定义一次。** 页面里只写自己那一页特有的样式。
  改过 `base.css` 就把各页引用的 `?v=N` 加一，否则浏览器会拿旧的。
- **`[hidden]{display:none !important}` 要写在页面自己的 `<style>` 里**，不能只放 `base.css`。
  外链 CSS 会被缓存，拿到旧文件时元素自己的 `display` 会顶掉 `hidden` 属性。
- **答案不以明文进 HTML。** 做题页的答案和解析编码存放，答完才解开；不提供一键看全部答案的入口。
