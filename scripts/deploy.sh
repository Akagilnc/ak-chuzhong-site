#!/usr/bin/env bash
# 检查 → 部署 → 逐页比对线上和本地是否逐字节一致。
set -euo pipefail
cd "$(dirname "$0")/.."
python3 scripts/check.py
source ~/.zshrc >/dev/null 2>&1 || true
npx wrangler pages deploy ./dist --project-name ak-study --branch main --commit-dirty=true

# 自定义域名切到新部署有几秒延迟，其间新路径会退回首页：隔几秒重比，最多 10 轮
for round in $(seq 1 10); do
  sleep 3
  bad=""
  while IFS= read -r f; do
    rel="${f#dist/}"; url="https://study.akbot.top/${rel%index.html}"
    [ "$(shasum -a 256 "$f" | cut -c1-64)" = "$(/usr/bin/curl -s "$url" | shasum -a 256 | cut -c1-64)" ] || bad="$bad $url"
  done < <(find dist -name '*.html' | sort)
  if [ -z "$bad" ]; then echo "线上全部页面与本地一致（第 $round 轮）"; exit 0; fi
done
echo "线上仍不一致：$bad" >&2
exit 1
