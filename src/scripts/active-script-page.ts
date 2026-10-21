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
    !(emptySection instanceof HTMLElement) ||
    !(content instanceof HTMLElement)
  ) {
    return null;
  }

  if (!script) {
    emptySection.classList.remove("is-loading");
    return null;
  } else {
    emptySection.classList.add("is-loading");
  }

  if (options.isReady && !options.isReady(script)) {
    return null;
  } 

  content.hidden = false;
  options.render(script);
  return script;
}
