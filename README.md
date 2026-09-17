# ak-chuzhong-site

初中数学的图解讲解页，一道题一页。图能拖能点，自己判完才给答案。

线上：<https://study.akbot.top>

## 结构

```
dist/                   发布目录，里面放什么就上线什么
├── index.html          首页目录
├── base.css            配色 / 底纹 / 字体 + 全站共用组件（按钮、卡片、结算、彩纸、小团子）
├── kit.js              全站共用脚本：Kit.dec 解答案、Kit.burst 撒彩纸、Kit.critter / Kit.mascot 画小团子
├── _headers            缓存策略
└── <slug>/index.html   一道题一页
```

## 风格

看的人是小朋友，**可爱有趣优先**。现有两页（`cube`、`meet`）就是样板，新页照着它们的结构写：

- 奶油底 + 糖果色，大圆角卡片，能按下去的立体按钮。颜色一律用 `base.css` 的变量，暗色模式才会跟着变。
- 小团子是吉祥物，有三种表情：`happy` 笑、`wow` 张嘴举手、`hmm` 歪嘴托腮。让它跟着交互变表情，比如判对了 `wow`、判错了 `hmm`。
- 页面分三段：`01` 能拖能点的演示 → `02` 讲道理的规则卡 → `03` 自己判 / 自己选。做完才揭晓终答，给星星和鼓励，可以再来一遍。
- 答对撒彩纸、卡片弹一下；答错卡片晃一晃，写「再想想」，不写冷冰冰的「错」。
- 可爱靠颜色、形状、团子和动效撑，**不靠字体**。谷歌字体在大陆常常加载不出来，退回系统字体时也得好看。

## 加一页

1. 页面写到 `dist/<slug>/index.html`，slug 用短英文。
2. 头部照抄。谷歌字体用 `media="print" onload` 的写法，**不能阻塞渲染**，否则在大陆会白屏好几秒：

   ```html
   <!doctype html>
   <html lang="zh">
   <head>
   <meta charset="utf-8">
   <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
   <title>页面名</title>
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=ZCOOL+KuaiLe&display=swap" media="print" onload="this.media='all'">
   <link rel="stylesheet" href="../base.css?v=3">
   <style>[hidden]{display:none !important}</style>
   </head>
   <body>
   ```
3. 标题区照抄样板：`.back` 回首页、`.eyebrow` 小标签、`h1`（重点词包 `.hl`）、`.problem` 题卡。
4. 页面脚本之前引入共用脚本：`<script src="../kit.js?v=1"></script>`。
5. 在首页 `<ul class="topics">` 末尾加一张卡，编号接着排。`--accent` 挑一个没用过的颜色（`--sky` `--cut` `--grape` `--pink` `--ok`）：

   ```html
   <li>
     <a class="topic" href="<slug>/" style="--accent:var(--grape); --accent-soft:var(--grape-soft)">
       <span class="topic-icon">🔺</span>
       <span class="topic-no">No.03</span>
       <span class="topic-title">标题</span>
       <span class="topic-tag">科目 · 知识点</span>
       <span class="topic-desc">一句话说清这页能干什么。</span>
       <span class="topic-go">开始玩 →</span>
     </a>
   </li>
   ```
6. 部署。

## 部署

```bash
source ~/.zshrc && npx wrangler pages deploy ./dist --project-name ak-study --branch main --commit-dirty=true
```

`source ~/.zshrc` 不能省，Cloudflare 的 token 在里面导出，非交互 subshell 不会自动 load。

部署后等几秒再验。自定义域名切到新部署有延迟，这段时间里新路径还不存在，Cloudflare Pages 会退回首页，看起来像没部署上。

## 约定

- **配色、字体和共用组件只在 `base.css` 里定义一次，共用脚本只在 `kit.js` 里写一次。** 页面里只写自己那一页特有的部分。
  改过 `base.css` 就把各页引用的 `?v=N` 加一；改过 `kit.js` 同理。否则浏览器会拿旧的。
- **`[hidden]{display:none !important}` 要写在页面自己的 `<style>` 里**，不能只放 `base.css`。
  外链 CSS 会被缓存，拿到旧文件时元素自己的 `display` 会顶掉 `hidden` 属性。
- **答案不以明文进 HTML。** 做题页的答案和解析编码存放（`Kit.dec` 解），答完才解开；不提供一键看全部答案的入口。
  「再来一遍」时要把上一轮解开的终答文字一起清掉，光把区块藏起来不够。
- **所有动效尊重 `prefers-reduced-motion`。** CSS 那边 `base.css` 已经统一关掉；JS 动画自己判 `Kit.reduceMotion`。
