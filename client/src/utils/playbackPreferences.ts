import * as SecureStore from 'expo-secure-store';

export const PLAYBACK_DEFAULT_RATE_KEY = 'playbackDefaultRate';
export const SLEEP_TIMER_PRESET_MINUTES_KEY = 'sleepTimerPresetMinutes';

export const PLAYBACK_RATE_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

export const SLEEP_TIMER_PRESET_MINUTES = [1, 15, 30, 45, 60, 90, 120] as const;

export async function getDefaultPlaybackRate(): Promise<number> {
  try {
    const raw = await SecureStore.getItemAsync(PLAYBACK_DEFAULT_RATE_KEY);
    if (raw == null || raw === '') return 1;
    const n = parseFloat(raw);
    if (!Number.isFinite(n)) return 1;
    const match = PLAYBACK_RATE_OPTIONS.find((r) => Math.abs(r - n) < 0.001);
    return match ?? 1;
  } catch {
    return 1;
  }
}

export async function setDefaultPlaybackRate(rate: number): Promise<void> {
  await SecureStore.setItemAsync(PLAYBACK_DEFAULT_RATE_KEY, String(rate));
}

/** Preset minutes for sleep timer in the player (optional). `null` = no preset. */
export async function getSleepTimerPresetMinutes(): Promise<number | null> {
  try {
    const raw = await SecureStore.getItemAsync(SLEEP_TIMER_PRESET_MINUTES_KEY);
    if (raw == null || raw === '' || raw === 'off' || raw === 'none') return null;
    const n = parseInt(raw, 10);
    if (Number.isNaN(n) || n <= 0) return null;
    return n;
  } catch {
    return null;
  }
}

export async function setSleepTimerPresetMinutes(minutes: number | null): Promise<void> {
  if (minutes == null) {
    await SecureStore.setItemAsync(SLEEP_TIMER_PRESET_MINUTES_KEY, 'off');
  } else {
    await SecureStore.setItemAsync(SLEEP_TIMER_PRESET_MINUTES_KEY, String(minutes));
  }
}
