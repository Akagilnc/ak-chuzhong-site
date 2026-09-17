/* 全站共用的小工具：解答案、撒彩纸、画小团子。
   每页在自己的 <script> 前引入：<script src="../kit.js?v=1"></script>，用 Kit.xxx 调。 */
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const el = (tag, attrs = {}, text) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  };

  // 答案存成 base64(UTF-8 JSON)，源码里不留明文，答完才解。
  // 要改答案先解开：python3 -c "import base64;print(base64.b64decode('...').decode())"
  const dec = b => JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(b), c => c.charCodeAt(0))));

  // 从 anchor 中心撒一把彩纸。
  // 按时长清除，不等 animationend：页面切到后台时动画会停，事件就不来，彩纸会一直挂在页面上。
  function burst(anchor, n = 20) {
    if (reduceMotion || !anchor) return;
    const r = anchor.getBoundingClientRect();
    const colors = ["var(--cut)", "var(--ok)", "var(--sky)", "var(--lemon)", "var(--pink)", "var(--grape)"];
    for (let i = 0; i < n; i++) {
      const s = document.createElement("span");
      s.className = "confetti";
      s.style.left = r.left + r.width / 2 + scrollX + "px";
      s.style.top = r.top + r.height / 2 + scrollY + "px";
      const a = Math.random() * Math.PI * 2, d = 50 + Math.random() * 100;
      s.style.setProperty("--dx", Math.cos(a) * d + "px");
      s.style.setProperty("--dy", Math.sin(a) * d - 40 + "px");
      s.style.setProperty("--rot", Math.random() * 720 - 360 + "deg");
      s.style.background = colors[i % colors.length];
      if (i % 3 === 0) s.style.borderRadius = "50%";
      document.body.append(s);
      setTimeout(() => s.remove(), 1100);
    }
  }

  // 一只小团子，画进一个 <g>，原点在身体中心，身体半径约 15.5。位置和大小由调用方用 transform 定。
  //   mood: "happy" 笑 / "wow" 张嘴举手 / "hmm" 歪嘴托腮
  //   look: 眼睛朝向，-1 左 · 0 正 · 1 右
  //   step: 走路相位，正数抬左脚、负数抬右脚
  function critter({ color = "var(--cut)", mood = "happy", look = 0, step = 0, name } = {}) {
    const g = el("g");
    const limb = (cx, cy, rx, ry, rot) =>
      g.append(el("ellipse", { cx, cy, rx, ry, fill: color, transform: `rotate(${rot} ${cx} ${cy})` }));

    if (mood === "wow") { limb(-15.5, -9, 3.4, 5.6, 30); limb(15.5, -9, 3.4, 5.6, -30); }
    else if (mood === "hmm") limb(-15.5, 4, 3.4, 5, 25);
    else { limb(-15.5, 4, 3.4, 5, 25); limb(15.5, 4, 3.4, 5, -25); }

    g.append(el("ellipse", { cx: -6.5, cy: 14 - (step > 0 ? 2.2 : 0), rx: 4.8, ry: 3.3, fill: color }));
    g.append(el("ellipse", { cx: 6.5, cy: 14 - (step < 0 ? 2.2 : 0), rx: 4.8, ry: 3.3, fill: color }));
    g.append(el("circle", { cx: 0, cy: 0, r: 15.5, fill: color }));
    g.append(el("ellipse", { cx: -5, cy: -8.5, rx: 5.2, ry: 3.2, class: "shine" }));
    if (mood === "hmm") limb(8.5, 9.5, 3.6, 3.6, 0);        // 托腮那只手要压在脸前面

    for (const ex of [-5.2, 5.2]) {
      if (mood === "wow") {
        g.append(el("circle", { cx: ex, cy: -2.6, r: 4.3, class: "eye-w" }));
        g.append(el("circle", { cx: ex + look * 1.2, cy: -2.4, r: 2.5, class: "eye-p" }));
        g.append(el("circle", { cx: ex + look * 1.2 - 1, cy: -3.5, r: .95, class: "eye-w" }));
      } else if (mood === "hmm") {
        g.append(el("circle", { cx: ex, cy: -2.6, r: 3.8, class: "eye-w" }));
        g.append(el("circle", { cx: ex + 1.2, cy: -4.1, r: 2, class: "eye-p" }));   // 眼珠往上翻，在想
      } else {
        g.append(el("circle", { cx: ex, cy: -2, r: 3.8, class: "eye-w" }));
        g.append(el("circle", { cx: ex + look * 1.5, cy: -1.5, r: 2, class: "eye-p" }));
      }
    }
    g.append(el("ellipse", { cx: -10.3, cy: 4.6, rx: 2.9, ry: 1.8, class: "blush" }));
    g.append(el("ellipse", { cx: 10.3, cy: 4.6, rx: 2.9, ry: 1.8, class: "blush" }));

    if (mood === "wow") g.append(el("ellipse", { cx: 0, cy: 6.8, rx: 2.8, ry: 3.3, class: "mouth-o" }));
    else if (mood === "hmm") g.append(el("path", { d: "M -3.6 6.6 Q -1.2 5 .8 6.4 T 3.4 5.8", class: "mouth" }));
    else g.append(el("path", { d: "M -3.4 5 Q 0 8.8 3.4 5", class: "mouth" }));

    if (name) g.append(el("text", { x: 0, y: -24, "text-anchor": "middle", class: "critter-name" }, name));
    return g;
  }

  // 单独一只团子的 <svg>，用在标题、说话气泡、结算卡上
  function mascot({ color, mood, look, size = 64 } = {}) {
    const s = el("svg", { viewBox: "-24 -22 48 42", width: size, height: size * 42 / 48, "aria-hidden": "true" });
    s.append(critter({ color, mood, look }));
    return s;
  }

  window.Kit = { NS, el, dec, burst, critter, mascot, reduceMotion };
})();
