import type { Script, StoredScript } from './script-store';
import { readStorageJson, writeStorageJson } from './storage';

export interface PracticeSettings {
  characters: string[];
  scenes: string[];
}

export interface PracticeCharacter {
  name: string;
  lines: number;
}

export interface PracticeScene {
  key: string;
  label: string;
  actTitle: string;
  lines: number;
}

const STORAGE_KEY = 'offscript-practice-settings';

export function getPracticeOptions(script: Script): {
  characters: PracticeCharacter[];
  scenes: PracticeScene[];
} {
  const characters = new Map<string, number>();
  const scenes: PracticeScene[] = [];

  for (const [actIndex, act] of (script.acts || []).entries()) {
    for (const [sceneIndex, scene] of (act.scenes || []).entries()) {
      const lines = (scene.lines || []).filter((line) => line.type === 'line');
      scenes.push({
        key: getSceneKey(actIndex, sceneIndex),
        label: scene.title || `Scene ${sceneIndex + 1}`,
        actTitle: act.title || `Act ${actIndex + 1}`,
        lines: lines.length,
      });

      for (const line of lines) {
        for (const character of new Set(line.characters || [])) {
          characters.set(character, (characters.get(character) || 0) + 1);
        }
      }
    }
  }

  return {
    characters: [...characters.entries()]
      .map(([name, lines]) => ({ name, lines }))
      .sort((first, second) => first.name.localeCompare(second.name)),
    scenes,
  };
}

export function getPracticeSettings(script: StoredScript): PracticeSettings {
  const options = getPracticeOptions(script);
  const stored = readSettings()[script.id];

  return {
    characters: Array.isArray(stored?.characters)
      ? stored.characters.filter((name) =>
          options.characters.some((character) => character.name === name),
        )
      : options.characters.map((character) => character.name),
    scenes: Array.isArray(stored?.scenes)
      ? stored.scenes.filter((key) =>
          options.scenes.some((scene) => scene.key === key),
        )
      : options.scenes.map((scene) => scene.key),
  };
}

export function savePracticeSettings(
  scriptId: string,
  settings: PracticeSettings,
): void {
  const allSettings = readSettings();
  allSettings[scriptId] = settings;
  if (writeStorageJson(STORAGE_KEY, allSettings)) {
    window.dispatchEvent(new CustomEvent('offscript:practice-settings-changed'));
  }
}

export function getSceneKey(actIndex: number, sceneIndex: number): string {
  return `${actIndex}-${sceneIndex}`;
}

function readSettings(): Record<string, PracticeSettings> {
  const stored = readStorageJson<unknown>(STORAGE_KEY, {});
  return stored && typeof stored === 'object' && !Array.isArray(stored)
    ? (stored as Record<string, PracticeSettings>)
    : {};
}
