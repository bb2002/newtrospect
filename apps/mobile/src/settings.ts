/**
 * 설정 저장 (AsyncStorage). 익스텐션의 settings.ts 미러 — 키 동일.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AnalysisKind } from "@newtrospect/core/server";

export interface Settings {
  apiBaseUrl: string;
  enabled: Record<AnalysisKind, boolean>;
  lastUrl: string;
}

export const DEFAULT_SETTINGS: Settings = {
  apiBaseUrl: "https://newtrospect-worker.ballbot.workers.dev",
  enabled: {
    term: true,
    sensational: true,
    quantitative: true,
    context: true,
  },
  lastUrl: "https://news.naver.com/",
};

const STORAGE_KEY = "newtrospect:settings";

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const partial = JSON.parse(raw) as Partial<Settings>;
    return {
      apiBaseUrl: partial.apiBaseUrl ?? DEFAULT_SETTINGS.apiBaseUrl,
      enabled: { ...DEFAULT_SETTINGS.enabled, ...(partial.enabled ?? {}) },
      lastUrl: partial.lastUrl ?? DEFAULT_SETTINGS.lastUrl,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(s: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* 무시 */
  }
}
