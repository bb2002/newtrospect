#!/bin/bash
# 1,000개 URL 분류 — article / non_article / idontknow
# 사용: bash classify.sh
B=/Users/ballbot/.claude/skills/gstack/browse/dist/browse
JS_FILE="$(pwd)/measure.js"
OUT=verify_results.jsonl
LOG=verify_progress.log
TARGET_ART=500
TARGET_NON=500

> "$OUT"
> "$LOG"

art_count=0
non_count=0
unk_count=0
total=0
START=$(date +%s)

while IFS= read -r URL; do
  [ -z "$URL" ] && continue
  total=$((total+1))

  # goto with short timeout
  STATUS=$(timeout 12 "$B" goto "$URL" 2>&1 | tail -1 | grep -oE '\([0-9]+\)' | tr -d '()')
  STATUS=${STATUS:-0}

  # measure body
  if [ "$STATUS" = "200" ]; then
    M=$(timeout 6 "$B" eval "$JS_FILE" 2>&1 | tail -1)
  else
    M="{}"
  fi

  # classify with jq
  CLS=$(echo "$M" | jq -r --arg status "$STATUS" '
    . as $m |
    ($m.ogt // "") as $ogt |
    ($m.hasPub // false) as $pub |
    ($m.nParas // 0) as $np |
    ($m.longParas // 0) as $lp |
    ($m.maxP // 0) as $mp |
    ($m.bodyLen // 0) as $bl |
    ($m.totalP // 0) as $tp |
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

  # write jsonl line
  echo "{\"url\":\"$URL\",\"status\":$STATUS,\"class\":\"$CLS\",\"m\":$M}" >> "$OUT"

  case "$CLS" in
    article) art_count=$((art_count+1));;
    non_article) non_count=$((non_count+1));;
    *) unk_count=$((unk_count+1));;
  esac

  if [ $((total % 25)) -eq 0 ]; then
    elapsed=$(($(date +%s) - START))
    rate=$(awk "BEGIN{printf \"%.2f\", $total / ($elapsed + 0.01)}")
    msg="[$total] art=$art_count non=$non_count unk=$unk_count elapsed=${elapsed}s rate=${rate}/s"
    echo "$msg" | tee -a "$LOG"
  fi

  # early stop when both buckets are full
  if [ "$art_count" -ge "$TARGET_ART" ] && [ "$non_count" -ge "$TARGET_NON" ]; then
    echo "[done] target reached at total=$total" | tee -a "$LOG"
    break
  fi
done < verify_pool.txt

elapsed=$(($(date +%s) - START))
echo "[final] total=$total art=$art_count non=$non_count unk=$unk_count elapsed=${elapsed}s" | tee -a "$LOG"
