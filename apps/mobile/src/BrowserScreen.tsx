import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView, type WebViewMessageEvent, type WebViewNavigation } from "react-native-webview";

import { INJECTION_BUNDLE } from "./injection-bundle.gen";
import { UrlBar } from "./UrlBar";
import { loadSettings, saveSettings, type Settings } from "./settings";
import type { BridgeMessage, InjectionConfig, PhaseMessage } from "./bridge";

export function BrowserScreen() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [navUrl, setNavUrl] = useState<string>("");
  const [phase, setPhase] = useState<PhaseMessage | null>(null);
  const webRef = useRef<WebView>(null);

  useEffect(() => {
    loadSettings().then((s) => {
      setSettings(s);
      setCurrentUrl(s.lastUrl);
      setNavUrl(s.lastUrl);
    });
  }, []);

  const config = useMemo<InjectionConfig | null>(() => {
    if (!settings) return null;
    return { apiBaseUrl: settings.apiBaseUrl, enabled: settings.enabled };
  }, [settings]);

  const beforeContentLoaded = useMemo(() => {
    if (!config) return "";
    return `window.__NEWTROSPECT_CONFIG__ = ${JSON.stringify(config)}; true;`;
  }, [config]);

  const onSubmitUrl = useCallback(
    (url: string) => {
      if (!url) return;
      setCurrentUrl(url);
      setNavUrl(url);
      setPhase(null);
      if (settings) saveSettings({ ...settings, lastUrl: url });
    },
    [settings],
  );

  const onReload = useCallback(() => {
    setPhase(null);
    webRef.current?.reload();
  }, []);

  const onNav = useCallback(
    (nav: WebViewNavigation) => {
      if (nav.url && nav.url !== currentUrl && !nav.loading) {
        setCurrentUrl(nav.url);
        if (settings) saveSettings({ ...settings, lastUrl: nav.url });
      }
    },
    [currentUrl, settings],
  );

  const onMessage = useCallback((ev: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(ev.nativeEvent.data) as BridgeMessage;
      if (msg.type === "phase") setPhase(msg);
    } catch {
      /* invalid JSON → 무시 */
    }
  }, []);

  if (!settings || !config) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
      <UrlBar value={currentUrl} phase={phase} onSubmit={onSubmitUrl} onReload={onReload} />
      <WebView
        ref={webRef}
        source={{ uri: navUrl }}
        style={styles.web}
        javaScriptEnabled
        domStorageEnabled
        thirdPartyCookiesEnabled
        sharedCookiesEnabled
        cacheEnabled
        injectedJavaScriptBeforeContentLoaded={beforeContentLoaded}
        injectedJavaScript={INJECTION_BUNDLE}
        onMessage={onMessage}
        onNavigationStateChange={onNav}
        mixedContentMode="always"
        originWhitelist={["*"]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#1c1c20",
  },
  loading: {
    flex: 1,
    backgroundColor: "#1c1c20",
    alignItems: "center",
    justifyContent: "center",
  },
  web: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

export default BrowserScreen;
