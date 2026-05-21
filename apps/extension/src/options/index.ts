import type { AnalysisKind } from "@newtrospect/core/server";
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from "../settings.ts";

async function init(): Promise<void> {
  const settings = await loadSettings();

  const apiInput = document.getElementById("apiBaseUrl") as HTMLInputElement;
  const autoInput = document.getElementById("autoDetect") as HTMLInputElement;
  const status = document.getElementById("status") as HTMLDivElement;

  apiInput.value = settings.apiBaseUrl;
  autoInput.checked = settings.autoDetect;

  const kindInputs = document.querySelectorAll<HTMLInputElement>("input[data-kind]");
  for (const el of kindInputs) {
    const kind = el.dataset.kind as AnalysisKind;
    el.checked = settings.enabled[kind];
  }

  async function persist(): Promise<void> {
    const enabled: Record<AnalysisKind, boolean> = { ...DEFAULT_SETTINGS.enabled };
    for (const el of kindInputs) {
      enabled[el.dataset.kind as AnalysisKind] = el.checked;
    }
    const rawUrl = apiInput.value.trim();
    let apiBaseUrl = DEFAULT_SETTINGS.apiBaseUrl;
    if (rawUrl) {
      try {
        const u = new URL(rawUrl);
        if (u.protocol !== "http:" && u.protocol !== "https:") {
          throw new Error("http(s) 만 허용");
        }
        // trailing slash 제거 — 클라이언트가 path를 직접 붙임
        apiBaseUrl = rawUrl.replace(/\/+$/, "");
      } catch (err) {
        status.textContent = `URL 형식 오류 — ${err instanceof Error ? err.message : String(err)}`;
        return;
      }
    }
    await saveSettings({ apiBaseUrl, autoDetect: autoInput.checked, enabled });
    status.textContent = "저장됨 · " + new Date().toLocaleTimeString();
  }

  apiInput.addEventListener("change", persist);
  autoInput.addEventListener("change", persist);
  for (const el of kindInputs) el.addEventListener("change", persist);
}

init().catch((err) => {
  console.error(err);
});
