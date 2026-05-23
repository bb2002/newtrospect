import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { PhaseMessage } from "./bridge";

interface Props {
  phase: PhaseMessage | null;
}

/**
 * UrlBar 우측에 박히는 컴팩트 상태 인디케이터.
 * 분석 진행을 짧게 표시 — phase 가 null 이면 자리는 잡고 비워둠(레이아웃 점프 방지).
 */
export function StatusBadge({ phase }: Props) {
  const { label, color } = phase ? describe(phase) : { label: "", color: "transparent" };
  return (
    <View style={[styles.box, { backgroundColor: color, opacity: label ? 1 : 0 }]}>
      <Text style={styles.text} numberOfLines={1}>
        {label || " "}
      </Text>
    </View>
  );
}

function describe(m: PhaseMessage): { label: string; color: string } {
  switch (m.phase) {
    case "extracting":
      return { label: "추출", color: "#3a3a44" };
    case "detecting":
      return { label: "판정", color: "#3a3a44" };
    case "analyzing": {
      const done = m.done ?? 0;
      const total = m.total ?? 4;
      return { label: `${done}/${total}`, color: "#3a5a8c" };
    }
    case "ok":
      return { label: m.errors ? `완료-${m.errors}` : "완료", color: "#2e7d4f" };
    case "skip":
      return { label: "스킵", color: "#6a6a72" };
    case "error":
      return { label: "에러", color: "#8c3a3a" };
    default:
      return { label: "", color: "transparent" };
  }
}

const styles = StyleSheet.create({
  box: {
    marginLeft: 6,
    minWidth: 48,
    height: 38,
    borderRadius: 8,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
});
