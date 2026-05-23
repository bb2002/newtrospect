#!/bin/bash
# verify_results.jsonl을 article.txt / non_article.txt / idontknow.txt로 분리
# 500개씩 cap, 부족하면 idontknow에서 보충
set -e
cd "$(dirname "$0")"

IN=all_verify.jsonl
OUT_DIR=/Users/ballbot/Documents/newtrospect

# 분류별로 추출
jq -r 'select(.class=="article") | .url' "$IN" > _all_article.txt
jq -r 'select(.class=="non_article") | .url' "$IN" > _all_nonarticle.txt
jq -r 'select(.class=="idontknow") | .url' "$IN" > _all_idontknow.txt

art_n=$(wc -l < _all_article.txt | tr -d ' ')
non_n=$(wc -l < _all_nonarticle.txt | tr -d ' ')
unk_n=$(wc -l < _all_idontknow.txt | tr -d ' ')
echo "분류 결과: article=$art_n, non_article=$non_n, idontknow=$unk_n"

# article 500개로 cap
head -500 _all_article.txt > "$OUT_DIR/article.txt"
art_final=$(wc -l < "$OUT_DIR/article.txt" | tr -d ' ')

# non_article 500개로 cap
head -500 _all_nonarticle.txt > "$OUT_DIR/non_article.txt"
non_final=$(wc -l < "$OUT_DIR/non_article.txt" | tr -d ' ')

# idontknow는 전부 저장
cp _all_idontknow.txt "$OUT_DIR/idontknow.txt"
unk_final=$(wc -l < "$OUT_DIR/idontknow.txt" | tr -d ' ')

echo
echo "=== 최종 저장 ==="
echo "  $OUT_DIR/article.txt: $art_final"
echo "  $OUT_DIR/non_article.txt: $non_final"
echo "  $OUT_DIR/idontknow.txt: $unk_final"
