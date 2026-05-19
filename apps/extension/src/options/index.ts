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
    await saveSettings({
      apiBaseUrl: apiInput.value.trim() || DEFAULT_SETTINGS.apiBaseUrl,
      autoDetect: autoInput.checked,
      enabled,
    });
    status.textContent = "저장됨 · " + new Date().toLocaleTimeString();
  }

  apiInput.addEventListener("change", persist);
  autoInput.addEventListener("change", persist);
  for (const el of kindInputs) el.addEventListener("change", persist);
}

init().catch((err) => {
  console.error(err);
});
