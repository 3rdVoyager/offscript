import { getActiveScript } from './script-store';
import type { StoredScript } from './script-schema';

interface ActiveScriptPageOptions {
  emptySelector: string;
  contentSelector: string;
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
    emptySection.hidden = false;
    return null;
  }

  emptySection.hidden = true;
  content.hidden = false;
  return script;
}
