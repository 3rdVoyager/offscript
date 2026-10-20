export interface ScriptLine {
  type?: string;
  text?: string;
  characters?: string[];
  progress?: number;
}

export interface ScriptScene {
  title?: string;
  lines?: ScriptLine[];
}

export interface ScriptAct {
  title?: string;
  scenes?: ScriptScene[];
}

export interface Script {
  id?: string;
  schemaVersion?: number;
  type?: string;
  title?: string;
  notes?: string;
  acts?: ScriptAct[];
}

export interface StoredScript extends Script {
  id: string;
}

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
  if (typeof localStorage === 'undefined') {
    return { ...EMPTY_STORE, scripts: [] };
  }

  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '');
    if (!stored || !Array.isArray(stored.scripts)) {
      return { ...EMPTY_STORE, scripts: [] };
    }

    return {
      activeScriptId:
        typeof stored.activeScriptId === 'string' ? stored.activeScriptId : null,
      scripts: stored.scripts
        .filter(
          (script: Script): script is StoredScript =>
            script &&
            typeof script === 'object' &&
            typeof script.id === 'string',
        )
        .map((script: StoredScript) => ({
          ...script,
          acts: addDefaultLineProgress(script.acts),
        })),
    };
  } catch {
    return { ...EMPTY_STORE, scripts: [] };
  }
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
  const storedScript: StoredScript = {
    ...scriptWithoutId,
    id: crypto.randomUUID(),
    title: script.title?.trim() || 'Untitled script',
    acts: addDefaultLineProgress(script.acts),
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent('offscript:scripts-changed'));
}

function addDefaultLineProgress(acts: ScriptAct[] | undefined): ScriptAct[] | undefined {
  if (!Array.isArray(acts)) {
    return acts;
  }

  return acts.map((act) => ({
    ...act,
    scenes: Array.isArray(act.scenes)
      ? act.scenes.map((scene) => ({
          ...scene,
          lines: Array.isArray(scene.lines)
            ? scene.lines.map((line) => ({
                ...line,
                progress: clampProgress(line.progress),
              }))
            : scene.lines,
        }))
      : act.scenes,
  }));
}

function clampProgress(progress: number | undefined): number {
  if (typeof progress !== 'number' || !Number.isFinite(progress)) {
    return 0;
  }

  return Math.min(100, Math.max(0, progress));
}
