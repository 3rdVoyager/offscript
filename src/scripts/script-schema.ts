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

export function getScriptValidationError(value: unknown): string | null {
  if (!isRecord(value)) {
    return 'The script must be a JSON object.';
  }

  if (value.schemaVersion !== 1 || value.type !== 'play') {
    return 'The script must use schema version 1 and type "play".';
  }

  if (typeof value.title !== 'string' || !value.title.trim()) {
    return 'The script needs a title.';
  }

  if (!Array.isArray(value.acts) || value.acts.length === 0) {
    return 'The script needs at least one act.';
  }

  for (const act of value.acts) {
    if (!isRecord(act) || typeof act.title !== 'string' || !Array.isArray(act.scenes)) {
      return 'Each act needs a title and scenes.';
    }

    for (const scene of act.scenes) {
      if (!isRecord(scene) || typeof scene.title !== 'string' || !Array.isArray(scene.lines)) {
        return 'Each scene needs a title and lines.';
      }

      for (const line of scene.lines) {
        if (
          !isRecord(line) ||
          !['line', 'direction'].includes(String(line.type)) ||
          typeof line.text !== 'string'
        ) {
          return 'Each line needs a valid type and text.';
        }

        if (
          line.type === 'line' &&
          (!Array.isArray(line.characters) ||
            line.characters.length === 0 ||
            line.characters.some((character) => typeof character !== 'string' || !character.trim()))
        ) {
          return 'Each spoken line needs at least one valid character.';
        }
      }
    }
  }

  return null;
}

export function isValidScript(value: unknown): value is Script {
  return getScriptValidationError(value) === null;
}

export function isStoredScript(value: unknown): value is StoredScript {
  return (
    isValidScript(value) &&
    isRecord(value) &&
    typeof value.id === 'string' &&
    Boolean(value.id)
  );
}

export function normalizeScript(script: Script): Script {
  return {
    ...script,
    title: script.title?.trim() || 'Untitled script',
    notes: typeof script.notes === 'string' ? script.notes.trim() : script.notes,
    acts: script.acts?.map((act) => ({
      ...act,
      title: act.title?.trim() || 'Untitled act',
      scenes: act.scenes?.map((scene) => ({
        ...scene,
        title: scene.title?.trim() || 'Untitled scene',
        lines: scene.lines?.map((line) => ({
          ...line,
          text: line.text?.trim() || '',
          characters: line.characters
            ?.filter((character) => typeof character === 'string' && character.trim())
            .map((character) => character.trim()),
          progress: clampProgress(line.progress),
        })),
      })),
    })),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function clampProgress(progress: number | undefined): number {
  if (typeof progress !== 'number' || !Number.isFinite(progress)) {
    return 0;
  }

  return Math.min(100, Math.max(0, progress));
}
