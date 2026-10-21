import {
  getPracticeSettings,
  getSceneKey,
} from './practice-settings';
import type { ScriptLine, StoredScript } from './script-schema';

export interface PracticeLine {
  line: ScriptLine;
  cueLine?: string;
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

      let previousCueLine = '';
      for (const [lineIndex, line] of (scene.lines || []).entries()) {
        const hasSelectedCharacter = (line.characters || []).some((character) =>
          settings.characters.includes(character),
        );

        if (line.type === 'line' && line.text?.trim() && hasSelectedCharacter) {
          lines.push({
            line,
            cueLine: previousCueLine || undefined,
            actIndex,
            sceneIndex,
            lineIndex,
          });
        }

        if (line.text?.trim()) {
          previousCueLine = line.text.trim();
        }
      }
    }
  }

  return settings.randomizeLineOrder ? shuffleLines(lines) : lines;
}

function shuffleLines(lines: PracticeLine[]): PracticeLine[] {
  const shuffled = [...lines];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}
