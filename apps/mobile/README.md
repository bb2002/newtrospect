# @newtrospect/mobile

newtrospect 안드로이드 앱. Expo SDK 54 + react-native-webview.

## 패키지 관리: npm (pnpm 아님)

mobile 은 **pnpm workspace 에서 의도적으로 제외**. Expo + Metro 의 hoisting 충돌
회피를 위해 자체 npm 으로 관리. `@newtrospect/core` 는 `file:../../packages/core`
의존성으로 참조 (npm 이 symlink 처리).

## 자주 쓰는 명령

```bash
cd apps/mobile

# 의존성 설치 (최초 1회 또는 package.json 변경 시)
npm install

# 개발 — Metro 띄우고 Expo Go (SDK 54) 로 QR 스캔
npm run start
#   prestart 가 자동으로 build:injection 실행

# 인젝션 번들만 다시 빌드 (injection/* 수정 시)
npm run build:injection

# 아이콘·스플래시 재생성 (디자인 수정 시)
npm run build:icons

# 타입체크
npm run typecheck
```

## APK 배포 워크플로

```bash
# 1. EAS CLI 설치 (전역, 1회)
npm install -g eas-cli

# 2. 로그인 (1회)
eas login

# 3. APK 빌드 (클라우드, 무료 큐 사용)
npm run build:apk
#   → EAS 클라우드에서 빌드 → 완료 후 .apk 다운로드 링크 제공
#   → eas.json 의 preview 프로필이 buildType: apk 로 설정됨

# 4. (선택) 로컬 빌드 — Android SDK + JDK 필요
npm run build:apk:local
```

배포 전 체크리스트:
- `app.json` 의 `expo.version` 과 `android.versionCode` 증가
- 아이콘·스플래시는 `assets/` 에 커밋되어 있어야 함 (없으면 `npm run build:icons`)
- `INJECTION_BUNDLE` 이 최신인지 — Metro/EAS 빌드는 prestart/prebuild 훅으로 자동 갱신

## 아키텍처

```
RN 본체 (App.tsx → BrowserScreen.tsx)
 ├─ UrlBar (입력기 + ▶ + ↻ + 컴팩트 상태 인디케이터)
 └─ WebView (react-native-webview)
     ├─ injectedJavaScriptBeforeContentLoaded
     │   → window.__NEWTROSPECT_CONFIG__ = { apiBaseUrl, enabled }
     └─ injectedJavaScript
         → IIFE 번들 (injection/entry.ts via esbuild)
           · @newtrospect/core extract + NewtrospectClient
           · highlight/popover/styles (extension content/* 미러)
```

인젝션 코드는 **빌드 타임에** esbuild 로 IIFE 로 번들된다
(`scripts/build-injection.mjs` → `src/injection-bundle.gen.ts`). RN 본체는 그
번들을 *문자열 상수*로만 import — Metro/Hermes 환경이 DOM API 와 충돌하지 않는다.

## 변경 시 주의

- `injection/` 수정 → `npm run build:injection` 필요 (`npm run start` 가 자동 실행)
- `@newtrospect/core` 변경 → metro.config.js 의 watchFolders 가 hot reload
- 익스텐션의 `content/highlight.ts`·`popover.ts`·`styles.ts` 를 의도적으로
  복사. 동작 차이가 생기면 두 파일 모두 갱신
- 아이콘 디자인 변경 → `scripts/build-icons.mjs` 의 STRIPE_COLORS·비율 수정 후
  `npm run build:icons`
