type ToastType = 'success' | 'error' | 'info';

let globalAddToast: ((msg: string, type: ToastType) => void) | null = null;

export function notify(message: string, type: ToastType = 'success') {
  globalAddToast?.(message, type);
}

export function setGlobalToast(fn: ((msg: string, type: ToastType) => void) | null) {
  globalAddToast = fn;
}