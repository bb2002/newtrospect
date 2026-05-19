import type { AnalysisKind } from "@newtrospect/core/server";

export interface Settings {
  apiBaseUrl: string;
  autoDetect: boolean;
  enabled: Record<AnalysisKind, boolean>;
}

export const DEFAULT_SETTINGS: Settings = {
  apiBaseUrl: "http://127.0.0.1:8787",
  autoDetect: true,
  enabled: {
    term: true,
    sensational: true,
    quantitative: true,
    context: true,
  },
};

const STORAGE_KEY = "newtrospect:settings";

export async function loadSettings(): Promise<Settings> {
  const stored = await chrome.storage.sync.get(STORAGE_KEY);
  const partial = stored[STORAGE_KEY] as Partial<Settings> | undefined;
  if (!partial) return DEFAULT_SETTINGS;
  return {
    apiBaseUrl: partial.apiBaseUrl ?? DEFAULT_SETTINGS.apiBaseUrl,
    autoDetect: partial.autoDetect ?? DEFAULT_SETTINGS.autoDetect,
    enabled: { ...DEFAULT_SETTINGS.enabled, ...(partial.enabled ?? {}) },
  };
}

export async function saveSettings(s: Settings): Promise<void> {
  await chrome.storage.sync.set({ [STORAGE_KEY]: s });
}
