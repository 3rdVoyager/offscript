export type ToastVariant = 'success' | 'error';

export interface PendingToast {
  message: string;
  variant: ToastVariant;
}

const PENDING_TOAST_KEY = 'offscript-pending-toast';

export function setPendingToast(
  message: string,
  variant: ToastVariant = 'success',
): void {
  try {
    sessionStorage.setItem(PENDING_TOAST_KEY, JSON.stringify({ message, variant }));
  } catch {
    // Ignore unavailable session storage.
  }
}

export function consumePendingToast(): PendingToast | null {
  try {
    const pendingToast = sessionStorage.getItem(PENDING_TOAST_KEY);
    if (!pendingToast) {
      return null;
    }

    sessionStorage.removeItem(PENDING_TOAST_KEY);
    const parsed: unknown = JSON.parse(pendingToast);
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !('message' in parsed) ||
      typeof parsed.message !== 'string'
    ) {
      return null;
    }

    return {
      message: parsed.message,
      variant:
        'variant' in parsed && parsed.variant === 'error' ? 'error' : 'success',
    };
  } catch {
    return null;
  }
}

export function showToast(
  message: string,
  variant: ToastVariant = 'success',
  duration = 4500,
): void {
  const container = document.querySelector('[data-toasts]');
  if (!(container instanceof HTMLElement)) {
    return;
  }

  const toast = document.createElement('div');
  toast.className = `toast toast--${variant}`;
  toast.setAttribute('role', variant === 'error' ? 'alert' : 'status');

  const text = document.createElement('span');
  text.textContent = message;

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'toast-close';
  close.setAttribute('aria-label', 'Dismiss notification');
  close.textContent = '×';
  close.addEventListener('click', () => removeToast());

  toast.append(text, close);
  container.append(toast);

  const timeout = window.setTimeout(removeToast, duration);

  function removeToast(): void {
    window.clearTimeout(timeout);
    toast.classList.add('is-leaving');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }
}
