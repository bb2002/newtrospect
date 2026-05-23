/**
 * 개인정보 처리방침 페이지 — /privacy 라우트에서 렌더.
 *
 * Chrome Web Store 등록·익스텐션 옵션 페이지·README 등에서 참조하는 캐노니컬 URL.
 * 워커가 처리하는 실제 데이터 흐름(D1 캐시·요청 로그·외부 AI 제공자 전송)을
 * 정확히 반영.
 */

const UPDATED_AT = "2026-05-23";

const HTML = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>newtrospect — 개인정보 처리방침</title>
  <meta name="description" content="newtrospect 가 처리하는 데이터의 범위와 보관 정책." />
  <style>
    :root {
      color-scheme: dark;
      --bg: #1c1c20;
      --fg: #f0f0f5;
      --muted: #9a9aa4;
      --accent-yellow: #ffdc5a;
      --accent-blue: #5a96ff;
      --accent-green: #50c878;
      --accent-red: #ff5a5a;
      --card: #25252b;
      --border: #38383f;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font: 16px/1.65 -apple-system, BlinkMacSystemFont, "Pretendard", "Apple SD Gothic Neo",
        "Noto Sans KR", sans-serif;
      background: var(--bg);
      color: var(--fg);
      padding: 32px 16px 80px;
    }
    main {
      max-width: 720px;
      margin: 0 auto;
    }
    header {
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--border);
    }
    .logo {
      display: flex;
      flex-direction: column;
      gap: 4px;
      width: 80px;
      margin-bottom: 16px;
    }
    .logo span {
      height: 10px;
      border-radius: 3px;
    }
    .logo .s1 { background: var(--accent-yellow); }
    .logo .s2 { background: var(--accent-blue); }
    .logo .s3 { background: var(--accent-green); }
    .logo .s4 { background: var(--accent-red); }
    h1 { font-size: 28px; margin: 0 0 4px; letter-spacing: -0.01em; }
    .subtitle { color: var(--muted); font-size: 14px; margin: 0; }
    .updated { color: var(--muted); font-size: 13px; margin-top: 12px; }
    h2 {
      font-size: 19px;
      margin: 40px 0 12px;
      padding-top: 4px;
      letter-spacing: -0.01em;
    }
    p { margin: 0 0 12px; }
    ul { margin: 0 0 12px; padding-left: 22px; }
    li { margin-bottom: 6px; }
    code {
      background: var(--card);
      padding: 1px 6px;
      border-radius: 4px;
      font: 13px/1 "SF Mono", Menlo, Consolas, monospace;
      color: var(--accent-green);
    }
    a { color: var(--accent-blue); }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 16px 18px;
      margin: 12px 0;
    }
    .card.warn { border-color: rgba(255, 220, 90, 0.4); }
    .tag {
      display: inline-block;
      font-size: 11px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      padding: 2px 8px;
      border-radius: 4px;
      margin-right: 6px;
      vertical-align: middle;
    }
    .tag.yes { background: rgba(80, 200, 120, 0.18); color: #88e0a8; }
    .tag.no { background: rgba(255, 90, 90, 0.18); color: #ff9999; }
    footer {
      margin-top: 64px;
      padding-top: 24px;
      border-top: 1px solid var(--border);
      color: var(--muted);
      font-size: 13px;
    }
  </style>
</head>
<body>
<main>
  <header>
    <div class="logo">
      <span class="s1"></span>
      <span class="s2"></span>
      <span class="s3"></span>
      <span class="s4"></span>
    </div>
    <h1>개인정보 처리방침</h1>
    <p class="subtitle">newtrospect — AI 기반 비판적 뉴스 읽기 보조 도구</p>
    <p class="updated">최종 업데이트: ${UPDATED_AT}</p>
  </header>

  <h2>1. 한눈에 보는 요약</h2>
  <div class="card">
    <ul>
      <li><span class="tag no">미수집</span> 이름·이메일·연락처·연령 등 개인 식별 정보</li>
      <li><span class="tag no">미수집</span> 로그인 정보·쿠키·비밀번호</li>
      <li><span class="tag no">미수집</span> IP 주소·위치·기기 식별자(서비스 측 저장 기준)</li>
      <li><span class="tag no">미저장</span> 사용자가 어떤 기사를 보았는지 추적하지 않음 (UID 없음)</li>
      <li><span class="tag no">미저장</span> 기사 본문 원문 (해시만 캐시 키로 사용)</li>
      <li><span class="tag yes">전송</span> 분석 시점에 본문 텍스트를 AI 제공자에 일시 전송</li>
    </ul>
  </div>

  <h2>2. 서비스 개요</h2>
  <p>
    newtrospect 는 사용자가 보고 있는 한국 뉴스 페이지의 본문 텍스트를 AI 가 분석하여
    네 가지 색의 인라인 하이라이트(핵심 문장·어려운 용어·수치·자극적 표현)로 표시하는
    브라우저 익스텐션 및 안드로이드 앱입니다. 본 페이지는 이 서비스가 사용하는
    분석 서버(Cloudflare Workers, 이하 "워커")의 데이터 처리 정책을 기술합니다.
  </p>

  <h2>3. 처리하는 데이터</h2>
  <p>워커는 다음 데이터를 받고 일부를 임시 저장합니다.</p>

  <h3 style="font-size:16px;margin:16px 0 8px">3.1 클라이언트에서 받는 데이터</h3>
  <ul>
    <li>
      <strong>기사 본문 평문</strong> — 익스텐션·앱이 페이지에서 추출한 본문 텍스트.
      분석을 위해 AI 제공자에 전달되며, <em>워커 측 데이터베이스에는 본문 자체를
      저장하지 않습니다.</em>
    </li>
    <li>
      <strong>본문의 SHA-256 해시</strong> — 동일 기사 재요청 시 캐시 히트 판정에 사용.
      해시로부터 원문을 복원할 수 없습니다.
    </li>
    <li>
      <strong>현재 페이지의 호스트(hostname)</strong> — 예: <code>news.naver.com</code>.
      어느 사이트에서 트래픽이 발생하는지 집계용. 전체 URL·경로·쿼리 문자열은 저장하지 않습니다.
    </li>
  </ul>

  <h3 style="font-size:16px;margin:16px 0 8px">3.2 워커가 저장하는 데이터 (D1)</h3>
  <ul>
    <li>
      <strong>analysis_cache 테이블</strong> — 본문 해시·분석 종류·AI 응답 JSON·모델명·만료
      시각. TTL <strong>1시간</strong>. 사용자 식별자는 없습니다.
    </li>
    <li>
      <strong>request_log 테이블</strong> — 시각, 호스트(예: <code>news.naver.com</code>),
      분석 종류, 모델, 응답 시간(ms), HTTP 상태 코드, 캐시 히트 여부. 본문·해시·UID 모두 없습니다.
    </li>
  </ul>

  <h3 style="font-size:16px;margin:16px 0 8px">3.3 인프라 사업자가 처리하는 부수 데이터</h3>
  <p>
    워커는 Cloudflare 인프라 위에서 실행되며, 인프라 운영을 위해 Cloudflare 가
    표준적인 보안·운영 목적으로 클라이언트 IP·요청 메타데이터를 일시 수집할 수
    있습니다. 이 데이터는 newtrospect 가 직접 접근·저장하지 않으며, Cloudflare 의
    데이터 처리 정책에 따릅니다.
  </p>

  <h2>4. 외부 제공 (AI 제공자)</h2>
  <p>분석을 위해 본문 텍스트가 다음 외부 사업자에게 일시 전송됩니다.</p>
  <ul>
    <li>
      <strong>Google Gemini API</strong> (현재 5개 엔드포인트 모두) —
      <code>gemini-3.1-flash-lite-preview</code> 모델에 본문 텍스트를 전송하여 분석 결과를
      받습니다. Google 의 데이터 처리·보관 정책이 적용됩니다.
    </li>
    <li>
      <strong>Cloudflare Workers AI</strong> (전환 시) — 워커 설정에 따라 분석 일부 또는
      전부가 Cloudflare 의 LLM(예: Llama)로 처리될 수 있습니다. Cloudflare 의 데이터
      처리 정책이 적용됩니다.
    </li>
  </ul>
  <p>
    어느 AI 제공자가 활성화되어 있는지는
    <a href="/health">/health</a> 엔드포인트의 응답으로 확인할 수 있습니다.
  </p>

  <h2>5. 보관 기간</h2>
  <ul>
    <li><strong>분석 캐시</strong>: 1시간 TTL. 만료 후 자동 삭제.</li>
    <li><strong>요청 로그</strong>: 운영 모니터링 용도로 무기한 보관할 수 있으나, 사용자 식별
      정보가 포함되지 않습니다.</li>
    <li><strong>외부 AI 제공자</strong>: 각 사업자의 정책에 따릅니다.</li>
  </ul>

  <h2>6. 추적하지 않는 항목</h2>
  <ul>
    <li>사용자 식별자(UID·세션·쿠키)</li>
    <li>전체 URL·페이지 경로·쿼리 문자열</li>
    <li>로그인 정보·인증 토큰·결제 정보</li>
    <li>마우스 위치·클릭·키 입력·스크롤 등 행동 데이터</li>
    <li>방문 페이지 목록(웹 기록)</li>
  </ul>

  <h2>7. 사용자 권리와 통제</h2>
  <ul>
    <li>
      익스텐션 옵션 페이지에서 <strong>자동 감지 끄기</strong>·<strong>색상별 표시 토글</strong>·
      <strong>분석 서버 URL 변경</strong>(자체 호스팅 워커로 전환) 이 가능합니다.
    </li>
    <li>
      캐시 키가 본문 해시이므로 별도 사용자별 삭제 요청 절차가 없습니다. 캐시는
      1시간 후 자동 만료되며, 사용자 단위로 식별 가능한 레코드 자체가 존재하지
      않습니다.
    </li>
    <li>
      익스텐션·앱을 제거하면 클라이언트에 저장된 설정도 함께 제거됩니다.
    </li>
  </ul>

  <h2>8. 어린이 데이터</h2>
  <p>
    newtrospect 는 만 14세 미만 아동을 직접 대상으로 하지 않으며, 연령 정보를 수집하지
    않습니다. 본문 텍스트 자체가 미성년자 식별 정보를 포함할 수 있으나, 워커는 본문을
    영구 저장하지 않습니다.
  </p>

  <h2>9. 변경 이력</h2>
  <ul>
    <li><strong>${UPDATED_AT}</strong> — 최초 공개.</li>
  </ul>

  <h2>10. 문의</h2>
  <p>
    문의·삭제 요청·정책 관련 의견은 GitHub 저장소의 Issues 로 받습니다.
  </p>

  <footer>
    <p>
      관련 엔드포인트:
      <a href="/health">/health</a> · 본 페이지: <code>/privacy</code>
    </p>
    <p>newtrospect — AI 비판적 뉴스 읽기 보조 도구.</p>
  </footer>
</main>
</body>
</html>`;

export function privacyHtml(): string {
  return HTML;
}
