import AsyncStorage from '@react-native-async-storage/async-storage';

import type { PersistedAppState } from '@/src/types';

const STORAGE_KEY = 'bege-shout.state.v1';

export async function loadPersistedState() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  return JSON.parse(raw) as PersistedAppState;
}

export async function savePersistedState(state: PersistedAppState) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
