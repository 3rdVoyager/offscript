import {
  getPracticeSettings,
  getSceneKey,
} from './practice-settings';
import type { ScriptLine, StoredScript } from './script-store';

export interface PracticeLine {
  line: ScriptLine;
  actIndex: number;
  sceneIndex: number;
  lineIndex: number;
}

export function getPracticeLines(activeScript: StoredScript): PracticeLine[] {
  const lines: PracticeLine[] = [];
  const settings = getPracticeSettings(activeScript);

  for (const [actIndex, act] of (activeScript.acts || []).entries()) {
    for (const [sceneIndex, scene] of (act.scenes || []).entries()) {
      if (!settings.scenes.includes(getSceneKey(actIndex, sceneIndex))) {
        continue;
      }

      for (const [lineIndex, line] of (scene.lines || []).entries()) {
        const hasSelectedCharacter = (line.characters || []).some((character) =>
          settings.characters.includes(character),
        );

        if (line.type === 'line' && line.text?.trim() && hasSelectedCharacter) {
          lines.push({ line, actIndex, sceneIndex, lineIndex });
        }
      }
    }
  }

  return lines;
}
