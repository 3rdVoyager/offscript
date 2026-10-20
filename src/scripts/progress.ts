import { updateScript, type Script, type StoredScript } from './script-store';

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

export function getProgressSummary(script: Script): ProgressSummary {
  const acts = Array.isArray(script.acts) ? script.acts : [];
  const actSummaries: ProgressEntry[] = [];
  let totalProgress = 0;
  let totalLines = 0;
  let totalCompleted = 0;

  for (const [actIndex, act] of acts.entries()) {
    const scenes = Array.isArray(act.scenes) ? act.scenes : [];
    let actProgress = 0;
    let actLines = 0;
    let actCompleted = 0;

    for (const scene of scenes) {
      const lines = Array.isArray(scene.lines) ? scene.lines : [];
      for (const line of lines) {
        const progress = getLineProgress(line.progress);
        actProgress += progress;
        actLines += 1;
        totalProgress += progress;
        totalLines += 1;

        if (progress >= 100) {
          actCompleted += 1;
          totalCompleted += 1;
        }
      }
    }

    actSummaries.push({
      title: act.title || `Act ${actIndex + 1}`,
      progress: actLines ? Math.round(actProgress / actLines) : 0,
      completed: actCompleted,
      lines: actLines,
    });
  }

  return {
    progress: totalLines ? Math.round(totalProgress / totalLines) : 0,
    completed: totalCompleted,
    lines: totalLines,
    acts: actSummaries,
  };
}

export function setLineProgress(
  scriptId: string,
  location: LineLocation,
  progress: number,
): boolean {
  return updateScript(scriptId, (script: StoredScript) => {
    const line = script.acts?.[location.actIndex]?.scenes?.[location.sceneIndex]?.lines?.[
      location.lineIndex
    ];

    if (line) {
      line.progress = getLineProgress(progress);
    }
  });
}
