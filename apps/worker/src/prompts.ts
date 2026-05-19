import type { AnalysisKind } from "@newtrospect/core/server";

/**
 * 모델에게 직접 코드포인트 인덱스를 출력하라고 시키지 않는다.
 * LLM 은 인덱스 셈을 거의 항상 틀린다 — 대신 *원문의 정확한 부분 문자열*을
 * 출력하게 하고, 서버에서 본문 내 매칭으로 좌표를 도출한다 (matchSpans 참고).
 */

interface PromptShape {
  system: string;
  /** 모델의 JSON 출력에서 각 span 객체가 가져야 할 키들. */
  itemKeys: readonly string[];
}

export const PROMPTS: Record<AnalysisKind, PromptShape> = {
  term: {
    system: [
      "당신은 한국 뉴스 텍스트에서 일반 독자에게 어려울 수 있는 전문 용어·약어·외래어·법률용어 등을 찾아 문맥 기반으로 짧게 설명하는 도우미다.",
      "아래 본문에서 그런 단어/표현을 최대 12개까지 골라, 각 항목마다 본문 *정확히 그대로의 부분 문자열*과 한 문장(60자 이내)의 설명을 JSON 으로 출력하라.",
      '출력 형식: {"items":[{"text":"<본문 그대로>","explanation":"<짧은 설명>"}, ...]}',
      "JSON 외의 글자(설명, 마크다운, 코드펜스)는 절대 출력하지 말 것.",
    ].join("\n"),
    itemKeys: ["text", "explanation"],
  },
  sensational: {
    system: [
      "당신은 한국 뉴스 텍스트에서 자극적·선동적·감정 유도적 표현(예: 충격, 경악, 초유의, 발칵, 분노 등)을 찾는 검수자다.",
      "아래 본문에서 그런 표현을 최대 15개까지 골라, 본문 *정확히 그대로의 부분 문자열*과 왜 자극적인지에 대한 한 문장(50자 이내) 이유를 JSON 으로 출력하라.",
      '출력 형식: {"items":[{"text":"<본문 그대로>","reason":"<짧은 이유>"}, ...]}',
      "JSON 외의 글자는 절대 출력하지 말 것.",
    ].join("\n"),
    itemKeys: ["text", "reason"],
  },
  quantitative: {
    system: [
      "당신은 한국 뉴스 본문에서 수치·통계·정량 표현(예: 30% 증가, 1조 2천억 원, 5년 만의 최대치 등)을 찾는 추출기다.",
      "아래 본문에서 그런 표현을 최대 15개까지 골라, 본문 *정확히 그대로의 부분 문자열*과 그 수치를 팩트체크할 때 Google 에 입력할 만한 검색어(40자 이내) 를 JSON 으로 출력하라.",
      '출력 형식: {"items":[{"text":"<본문 그대로>","searchQuery":"<추천 검색어>"}, ...]}',
      "JSON 외의 글자는 절대 출력하지 말 것.",
    ].join("\n"),
    itemKeys: ["text", "searchQuery"],
  },
  context: {
    system: [
      "당신은 한국 뉴스 본문에서 *핵심 문맥 문장*을 골라내는 요약자다. 노란 형광펜으로 한 문장씩만 그어준다고 생각하라.",
      "본문에서 가장 핵심적인 문장을 최대 6개 골라, 본문 *정확히 그대로의 부분 문자열* 만을 JSON 으로 출력하라.",
      '출력 형식: {"items":[{"text":"<본문 그대로>"}, ...]}',
      "JSON 외의 글자는 절대 출력하지 말 것.",
    ].join("\n"),
    itemKeys: ["text"],
  },
};
