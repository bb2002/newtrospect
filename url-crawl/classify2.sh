#!/bin/bash
# 추가 200개 검증 — non_article 부족분 보충용
B=/Users/ballbot/.claude/skills/gstack/browse/dist/browse
JS_FILE="$(pwd)/measure.js"
OUT=verify_results2.jsonl
LOG=verify_progress2.log

> "$OUT"
> "$LOG"
total=0
non_count=0
START=$(date +%s)

while IFS= read -r URL; do
  [ -z "$URL" ] && continue
  total=$((total+1))
  STATUS=$(timeout 12 "$B" goto "$URL" 2>&1 | tail -1 | grep -oE '\([0-9]+\)' | tr -d '()')
  STATUS=${STATUS:-0}
  if [ "$STATUS" = "200" ]; then
    M=$(timeout 6 "$B" eval "$JS_FILE" 2>&1 | tail -1)
  else
    M="{}"
  fi
  CLS=$(echo "$M" | jq -r --arg status "$STATUS" '
    . as $m |
    ($m.ogt // "") as $ogt |
    ($m.hasPub // false) as $pub |
    ($m.nParas // 0) as $np |
    ($m.longParas // 0) as $lp |
    ($m.maxP // 0) as $mp |
    ($m.bodyLen // 0) as $bl |
    if ($status | tonumber? // 0) != 200 then "idontknow"
    elif $ogt == "article" then "article"
    elif $ogt == "website" or $ogt == "object" then "non_article"
    elif $pub == true and $lp >= 3 then "article"
    elif $lp >= 5 and $mp >= 80 then "article"
    elif $lp <= 1 and $bl < 600 then "non_article"
    elif $np > 80 and ($lp / ($np + 0.01)) < 0.12 then "non_article"
    elif $bl < 1500 and $lp < 3 then "non_article"
    else "idontknow"
    end
  ' 2>/dev/null)
  CLS=${CLS:-idontknow}
  echo "{\"url\":\"$URL\",\"status\":$STATUS,\"class\":\"$CLS\",\"m\":$M}" >> "$OUT"
  [ "$CLS" = "non_article" ] && non_count=$((non_count+1))

  if [ $((total % 25)) -eq 0 ]; then
    elapsed=$(($(date +%s) - START))
    echo "[$total] non=$non_count elapsed=${elapsed}s" | tee -a "$LOG"
  fi
done < verify_pool2.txt

elapsed=$(($(date +%s) - START))
echo "[final] total=$total non=$non_count elapsed=${elapsed}s" | tee -a "$LOG"
