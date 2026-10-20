export type ToastVariant = 'success' | 'error';

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
