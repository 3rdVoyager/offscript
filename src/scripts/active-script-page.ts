import { getActiveScript } from './script-store';
import type { StoredScript } from './script-schema';

interface ActiveScriptPageOptions {
  emptySelector: string;
  contentSelector: string;
  isReady?: (script: StoredScript) => boolean;
  render: (script: StoredScript) => void;
}

export function initializeActiveScriptPage(
  options: ActiveScriptPageOptions,
): StoredScript | null {
  const script = getActiveScript();
  const emptySection = document.querySelector(options.emptySelector);
  const content = document.querySelector(options.contentSelector);

  if (
    !script ||
    !(emptySection instanceof HTMLElement) ||
    !(content instanceof HTMLElement) ||
    (options.isReady && !options.isReady(script))
  ) {
    return null;
  }

  emptySection.hidden = true;
  content.hidden = false;
  options.render(script);
  return script;
}
