const TOAST_EVENT = "app:toast";

export type ToastDetail = { id: number; message: string };

export function showToast(message: string) {
  window.dispatchEvent(
    new CustomEvent<ToastDetail>(TOAST_EVENT, { detail: { id: Date.now(), message } })
  );
}

export function onToast(handler: (toast: ToastDetail) => void) {
  function listener(event: Event) {
    handler((event as CustomEvent<ToastDetail>).detail);
  }
  window.addEventListener(TOAST_EVENT, listener);
  return () => window.removeEventListener(TOAST_EVENT, listener);
}
