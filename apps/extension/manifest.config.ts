import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,
  name: "newtrospect",
  description: "AI 기반 비판적 뉴스 읽기 보조 도구",
  version: "0.0.1",
  action: {
    default_title: "newtrospect — 이 페이지 분석",
    default_icon: { "16": "icons/icon-16.png", "48": "icons/icon-48.png" },
  },
  options_page: "src/options/index.html",
  background: {
    service_worker: "src/background/index.ts",
    type: "module",
  },
  content_scripts: [
    {
      matches: ["<all_urls>"],
      js: ["src/content/index.ts"],
      run_at: "document_idle",
    },
  ],
  permissions: ["storage", "activeTab", "scripting"],
  host_permissions: ["http://localhost/*", "http://127.0.0.1/*", "https://*/*"],
  icons: { "16": "icons/icon-16.png", "48": "icons/icon-48.png", "128": "icons/icon-128.png" },
});
