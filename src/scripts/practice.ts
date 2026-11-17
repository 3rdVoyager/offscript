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

  return lines;
}

export function getOrderLines(
  activeScript: StoredScript,
  windowSize = 10,
): PracticeLine[] {
  const settings = getPracticeSettings(activeScript);
  const candidateWindows: PracticeLine[][] = [];

  for (const [actIndex, act] of (activeScript.acts || []).entries()) {
    for (const [sceneIndex, scene] of (act.scenes || []).entries()) {
      if (!settings.scenes.includes(getSceneKey(actIndex, sceneIndex))) {
        continue;
      }

      const sceneLines: Array<{
        practiceLine: PracticeLine;
        isSelectedCharacter: boolean;
      }> = [];

      for (const [lineIndex, line] of (scene.lines || []).entries()) {
        if (line.type !== 'line' || !line.text?.trim()) {
          continue;
        }

        sceneLines.push({
          practiceLine: {
            line,
            actIndex,
            sceneIndex,
            lineIndex,
          },
          isSelectedCharacter: (line.characters || []).some((character) =>
            settings.characters.includes(character),
          ),
        });
      }

      const size = Math.min(windowSize, sceneLines.length);
      for (let start = 0; start <= sceneLines.length - size; start += 1) {
        const window = sceneLines.slice(start, start + size);
        if (window.some((entry) => entry.isSelectedCharacter)) {
          candidateWindows.push(
            window.map((entry) => entry.practiceLine),
          );
        }
      }
    }
  }

  if (candidateWindows.length === 0) {
    return [];
  }

  return candidateWindows[
    Math.floor(Math.random() * candidateWindows.length)
  ];
}
