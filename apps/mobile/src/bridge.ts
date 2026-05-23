/**
 * WebView ↔ RN 메시지 타입. injection/entry.ts 가 postMessage 로 보내는 메시지를
 * RN onMessage 가 받아서 phase 별 UI 업데이트.
 */
import type { AnalysisKind } from "@newtrospect/core/server";

export type Phase =
  | "extracting"
  | "detecting"
  | "analyzing"
  | "ok"
  | "error"
  | "skip";

export interface PhaseMessage {
  type: "phase";
  phase: Phase;
  url?: string;
  introspect?: boolean;
  reason?: "too-short" | "not-article" | "all-disabled";
  message?: string;
  done?: number;
  total?: number;
  errors?: number;
  textLen?: number;
}

export type BridgeMessage = PhaseMessage;

export interface InjectionConfig {
  apiBaseUrl: string;
  enabled: Record<AnalysisKind, boolean>;
}
