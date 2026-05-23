import React, { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View, Text } from "react-native";
import { StatusBadge } from "./StatusBadge";
import type { PhaseMessage } from "./bridge";

interface Props {
  value: string;
  phase: PhaseMessage | null;
  onSubmit: (url: string) => void;
  onReload: () => void;
}

export function UrlBar({ value, phase, onSubmit, onReload }: Props) {
  const [text, setText] = useState(value);

  React.useEffect(() => {
    setText(value);
  }, [value]);

  const submit = () => {
    onSubmit(normalize(text));
  };

  return (
    <View style={styles.row}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        onSubmitEditing={submit}
        placeholder="https://news.naver.com/..."
        placeholderTextColor="#888"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        returnKeyType="go"
        selectTextOnFocus
      />
      <TouchableOpacity style={styles.button} onPress={submit}>
        <Text style={styles.buttonText}>▶</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={onReload}>
        <Text style={styles.buttonText}>↻</Text>
      </TouchableOpacity>
      <StatusBadge phase={phase} />
    </View>
  );
}

function normalize(input: string): string {
  const t = input.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  if (/^[^\s]+\.[^\s]+$/.test(t)) return `https://${t}`;
  return `https://www.google.com/search?q=${encodeURIComponent(t)}`;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: "#1c1c20",
  },
  input: {
    flex: 1,
    height: 38,
    paddingHorizontal: 12,
    backgroundColor: "#2a2a30",
    color: "#fff",
    borderRadius: 8,
    fontSize: 14,
  },
  button: {
    marginLeft: 6,
    width: 40,
    height: 38,
    borderRadius: 8,
    backgroundColor: "#3a3a44",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
