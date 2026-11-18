import { useSyncExternalStore } from "react";

/* 朗读统一走浏览器自带语音合成：不联网、不上传、不自动播放，
   所有发声都由孩子或家长点击触发。音色优先选中文女声并提高音调，接近少女音。 */

const KEY = "marrow-factory:voice";
const FEMALE_HINTS = /(xiaoxiao|xiaoyi|yaoyao|huihui|meijia|tingting|sin-ji|female|woman|女|晓晓|晓伊|瑶瑶|惠惠|美佳|婷婷)/i;

const listeners = new Set<() => void>();
let voiceCache: SpeechSynthesisVoice | null | undefined;

export function voiceSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function saved(): boolean {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

export function setVoiceOn(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    // Private mode: the choice lasts for this visit only.
  }
  if (!on) stopSpeaking();
  listeners.forEach((listener) => listener());
}

export function useVoiceOn(): boolean {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    saved,
    () => true,
  );
}

function pickVoice(): SpeechSynthesisVoice | null {
  if (!voiceSupported()) return null;
  if (voiceCache !== undefined) return voiceCache;
  const voices = window.speechSynthesis.getVoices();
  const zh = voices.filter((voice) => /zh|chinese/i.test(voice.lang));
  voiceCache = zh.find((voice) => FEMALE_HINTS.test(voice.name)) ?? zh[0] ?? voices.find((voice) => FEMALE_HINTS.test(voice.name)) ?? null;
  return voiceCache;
}

if (voiceSupported()) {
  window.speechSynthesis.addEventListener("voiceschanged", () => {
    voiceCache = undefined;
  });
}

export function stopSpeaking() {
  if (voiceSupported()) window.speechSynthesis.cancel();
}

export function speak(text: string, onEnd?: () => void): boolean {
  if (!voiceSupported() || !saved()) return false;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  const voice = pickVoice();
  if (voice) utterance.voice = voice;
  utterance.pitch = 1.3;
  utterance.rate = 1;
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();
  synth.speak(utterance);
  return true;
}
