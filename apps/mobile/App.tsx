/**
 * S1 spike — Expo Go + react-native-webview 적합성 검증 앱.
 *
 * 검증할 것 3가지:
 *  1. injectedJavaScriptBeforeContentLoaded 가 임의 사이트(네이버 뉴스 등) 에서 실행되는가?
 *  2. SPA 페이지 전환 시 onNavigationStateChange 가 호출되는가?
 *  3. 인젝션된 스크립트에서 cross-origin fetch 가 되는가?
 *
 * 결과는 화면 하단 로그 패널에서 확인. 각 페이지 로드마다:
 *   [inject] DOM readyState
 *   [fetch]  cross-origin 응답 결과
 *   [nav]    url + loading 상태 (페이지 전환마다)
 *
 * Expo Go 에서 실행: `pnpm -F @newtrospect/mobile start` 후
 * 폰의 Expo Go 앱으로 QR 코드 스캔.
 */

import { useRef, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View, Button } from "react-native";
import { WebView, type WebViewMessageEvent, type WebViewNavigation } from "react-native-webview";

const DEFAULT_URL = "https://news.naver.com/";

const INJECTION = `
(function() {
  const log = (m) => {
    try {
      window.ReactNativeWebView.postMessage(JSON.stringify({type: "log", msg: m}));
    } catch (e) {}
  };
  log("[inject] DOM readyState=" + document.readyState);

  fetch("https://httpbin.org/get")
    .then((r) => r.json())
    .then((j) => log("[fetch] OK url=" + (j.url || "?")))
    .catch((e) => log("[fetch] FAIL " + e.message));

  // SPA pushState 변화도 로깅
  const origPush = history.pushState;
  history.pushState = function() {
    log("[pushState] " + location.href);
    return origPush.apply(this, arguments);
  };
})();
true;
`;

export default function App() {
  const [url, setUrl] = useState(DEFAULT_URL);
  const [draft, setDraft] = useState(DEFAULT_URL);
  const [logs, setLogs] = useState<string[]>([]);
  const ref = useRef<WebView>(null);

  const append = (line: string) => {
    setLogs((prev) => {
      const next = [...prev, `${new Date().toLocaleTimeString()}  ${line}`];
      return next.slice(-80);
    });
  };

  const onMessage = (e: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(e.nativeEvent.data) as { type: string; msg: string };
      append(data.msg);
    } catch {
      append("[msg-raw] " + e.nativeEvent.data);
    }
  };

  const onNav = (s: WebViewNavigation) => {
    append(`[nav] ${s.url}  loading=${s.loading}`);
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.urlBar}>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Button title="이동" onPress={() => setUrl(draft)} />
      </View>

      <View style={styles.webview}>
        <WebView
          ref={ref}
          source={{ uri: url }}
          injectedJavaScriptBeforeContentLoaded={INJECTION}
          onMessage={onMessage}
          onNavigationStateChange={onNav}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={["*"]}
        />
      </View>

      <ScrollView style={styles.logs} contentContainerStyle={{ padding: 8 }}>
        {logs.map((l, i) => (
          <Text key={i} style={styles.log}>
            {l}
          </Text>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0d0f12" },
  urlBar: { flexDirection: "row", padding: 8, gap: 8, backgroundColor: "#1b1f24" },
  input: {
    flex: 1,
    backgroundColor: "#22272d",
    color: "#fff",
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  webview: { flex: 3, backgroundColor: "#fff" },
  logs: { flex: 2, backgroundColor: "#0d0f12" },
  log: { color: "#9fffa3", fontFamily: "Menlo", fontSize: 11, marginBottom: 2 },
});
