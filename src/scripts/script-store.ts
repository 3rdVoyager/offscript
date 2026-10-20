import {
  isStoredScript,
  normalizeScript,
  type Script,
  type StoredScript,
} from './script-schema';
import { readStorageJson, writeStorageJson } from './storage';

export type {
  Script,
  ScriptLine,
  ScriptAct,
  ScriptScene,
  StoredScript,
} from './script-schema';

export interface ScriptStore {
  activeScriptId: string | null;
  scripts: StoredScript[];
}

const STORAGE_KEY = 'offscript-scripts';
const EMPTY_STORE: ScriptStore = {
  activeScriptId: null,
  scripts: [],
};

export function getScriptStore(): ScriptStore {
  const stored = readStorageJson<unknown>(STORAGE_KEY, null);
  if (
    !stored ||
    typeof stored !== 'object' ||
    !('scripts' in stored) ||
    !Array.isArray(stored.scripts)
  ) {
    return { ...EMPTY_STORE, scripts: [] };
  }

  const scripts = stored.scripts
    .filter(isStoredScript)
    .map((script) => normalizeScript(script) as StoredScript);
  const savedActiveId =
    'activeScriptId' in stored && typeof stored.activeScriptId === 'string'
      ? stored.activeScriptId
      : null;

  return {
    activeScriptId: scripts.some((script) => script.id === savedActiveId)
      ? savedActiveId
      : scripts[0]?.id || null,
    scripts,
  };
}

export function getScripts(): StoredScript[] {
  return getScriptStore().scripts;
}

export function getActiveScript(): StoredScript | null {
  const store = getScriptStore();
  return (
    store.scripts.find((script) => script.id === store.activeScriptId) ||
    store.scripts[0] ||
    null
  );
}

export function getActiveScriptId(): string | null {
  return getScriptStore().activeScriptId;
}

export function addScript(script: Script): StoredScript {
  const store = getScriptStore();
  const { id: _oldId, ...scriptWithoutId } = script;
  const normalizedScript = normalizeScript(scriptWithoutId);
  const storedScript: StoredScript = {
    ...normalizedScript,
    id: crypto.randomUUID(),
  };

  store.scripts.push(storedScript);
  store.activeScriptId = storedScript.id;
  saveStore(store);
  return storedScript;
}

export function setActiveScript(scriptId: string): boolean {
  const store = getScriptStore();
  if (!store.scripts.some((script) => script.id === scriptId)) {
    return false;
  }

  store.activeScriptId = scriptId;
  saveStore(store);
  return true;
}

export function updateScript(
  scriptId: string,
  update: (script: StoredScript) => void,
): boolean {
  const store = getScriptStore();
  const script = store.scripts.find((item) => item.id === scriptId);
  if (!script) {
    return false;
  }

  update(script);
  saveStore(store);
  return true;
}

export function deleteScript(scriptId: string): boolean {
  const store = getScriptStore();
  const scriptIndex = store.scripts.findIndex((script) => script.id === scriptId);
  if (scriptIndex === -1) {
    return false;
  }

  store.scripts.splice(scriptIndex, 1);
  if (store.activeScriptId === scriptId) {
    store.activeScriptId = store.scripts[0]?.id || null;
  }

  saveStore(store);
  return true;
}

function saveStore(store: ScriptStore): void {
  if (writeStorageJson(STORAGE_KEY, store)) {
    window.dispatchEvent(new CustomEvent('offscript:scripts-changed'));
  }
}
