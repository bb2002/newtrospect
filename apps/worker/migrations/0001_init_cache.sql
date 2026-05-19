-- Phase 1: 익명 캐시 전용. UID 없음, 본문 자체 저장 없음.
-- 키 = (본문 SHA-256, 분석 종류). 값 = JSON 응답 + 만료 시각.

CREATE TABLE IF NOT EXISTS analysis_cache (
  body_hash TEXT NOT NULL,
  kind TEXT NOT NULL,
  response_json TEXT NOT NULL,
  model TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  PRIMARY KEY (body_hash, kind)
);

CREATE INDEX IF NOT EXISTS idx_analysis_cache_expires
  ON analysis_cache (expires_at);

-- 로깅 — host, model, kind, elapsedMs, status. 본문/사용자 식별자 미저장.
CREATE TABLE IF NOT EXISTS request_log (
  ts INTEGER NOT NULL,
  host TEXT,
  kind TEXT NOT NULL,
  model TEXT,
  elapsed_ms INTEGER,
  status_code INTEGER NOT NULL,
  cache_hit INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_request_log_ts ON request_log (ts);
