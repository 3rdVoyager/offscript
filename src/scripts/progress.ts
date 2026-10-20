import { getPracticeLines } from './practice';
import { updateScript } from './script-store';
import type { StoredScript } from './script-schema';

export interface LineLocation {
  actIndex: number;
  sceneIndex: number;
  lineIndex: number;
}

export interface ProgressEntry {
  title: string;
  progress: number;
  completed: number;
  lines: number;
}

export interface ProgressSummary {
  progress: number;
  completed: number;
  lines: number;
  acts: ProgressEntry[];
}

export function getLineProgress(progress: number | undefined): number {
  if (typeof progress !== 'number' || !Number.isFinite(progress)) {
    return 0;
  }

  return Math.round(Math.min(100, Math.max(0, progress)));
}

export function getProgressSummary(script: StoredScript): ProgressSummary {
  const practiceLines = getPracticeLines(script);
  const actSummaries = new Map<number, ProgressEntry>();
  let totalProgress = 0;
  let totalLines = 0;
  let totalCompleted = 0;

  for (const practiceLine of practiceLines) {
    const progress = getLineProgress(practiceLine.line.progress);
    const actIndex = practiceLine.actIndex;
    const actTitle = script.acts?.[actIndex]?.title || `Act ${actIndex + 1}`;
    const act = actSummaries.get(actIndex) || {
      title: actTitle,
      progress: 0,
      completed: 0,
      lines: 0,
    };

    act.progress += progress;
    act.lines += 1;
    if (progress >= 100) {
      act.completed += 1;
      totalCompleted += 1;
    }

    totalProgress += progress;
    totalLines += 1;
    actSummaries.set(actIndex, act);
  }

  return {
    progress: totalLines ? Math.round(totalProgress / totalLines) : 0,
    completed: totalCompleted,
    lines: totalLines,
    acts: [...actSummaries.entries()]
      .sort(([firstIndex], [secondIndex]) => firstIndex - secondIndex)
      .map(([, act]) => ({
        ...act,
        progress: act.lines ? Math.round(act.progress / act.lines) : 0,
      })),
  };
}

export function setLineProgress(
  scriptId: string,
  location: LineLocation,
  progress: number,
): boolean {
  return updateScript(scriptId, (script: StoredScript) => {
    const practiceLine = getPracticeLines(script).find(
      (item) =>
        item.actIndex === location.actIndex &&
        item.sceneIndex === location.sceneIndex &&
        item.lineIndex === location.lineIndex,
    );

    if (practiceLine) {
      practiceLine.line.progress = getLineProgress(progress);
    }
  });
}
