#!/usr/bin/env python3
"""页面约定的机械检查。pre-commit 和 deploy.sh 都跑它；规则的来由见 README「约定」。"""
import base64, json, pathlib, re, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
pages = sorted(DIST.rglob("*.html"))
errors = []

def head_text(rel):
    try:
        return subprocess.run(["git", "show", f"HEAD:{rel}"], cwd=ROOT, capture_output=True, text=True, check=True).stdout
    except subprocess.CalledProcessError:
        return None

versions = {"base.css": set(), "kit.js": set()}
for p in pages:
    rel, s = p.relative_to(ROOT), p.read_text(encoding="utf-8")

    # 外链 CSS 被缓存时 display 会顶掉 hidden 属性，答案就露出来：每页自己的 <style> 里必须有这条
    styles = "".join(re.findall(r"<style>(.*?)</style>", s, re.S))
    if "[hidden]{display:none !important}" not in styles:
        errors.append(f"{rel}: 自己的 <style> 里缺 [hidden]{{display:none !important}}")

    # 谷歌字体在大陆常加载不出来，阻塞渲染会白屏
    for tag in re.findall(r"<link[^>]*fonts\.googleapis\.com/css[^>]*>", s):
        if 'media="print"' not in tag:
            errors.append(f"{rel}: 谷歌字体没用 media=\"print\" onload 写法")

    # 答案只能以 base64(JSON) 进页面
    for m in re.finditer(r'(?:\bk\s*:|\bFIN\s*=)\s*"([^"]*)"', s):
        try:
            json.loads(base64.b64decode(m.group(1), validate=True).decode("utf-8"))
        except Exception:
            errors.append(f"{rel}: 答案字段不是 base64(JSON)：{m.group(1)[:30]}…")
    for m in re.finditer(r'(?:"(?:ans|big)"|\b(?:ans|big))\s*:', s):
        errors.append(f"{rel}: 出现明文答案键 {m.group(0)}")

    for name in versions:
        versions[name].update(re.findall(re.escape(name) + r"\?v=(\d+)", s))

for name, vs in versions.items():
    if len(vs) > 1:
        errors.append(f"各页引用的 {name}?v= 不一致：{sorted(vs)}")
    # 改了共用文件却没加版本号，浏览器会继续用缓存里的旧文件
    old = head_text(f"dist/{name}")
    if old is not None and old != (DIST / name).read_text(encoding="utf-8"):
        old_v = set(re.findall(re.escape(name) + r"\?v=(\d+)", head_text("dist/index.html") or ""))
        if vs and vs == old_v:
            errors.append(f"dist/{name} 改过了，但 ?v= 还是 {sorted(vs)}，各页都要加一")

if errors:
    print("check 未通过：", *errors, sep="\n  ")
    sys.exit(1)
print(f"check 通过：{len(pages)} 个页面")
