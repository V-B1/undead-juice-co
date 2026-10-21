export const lifecycleEvents = new EventTarget();

export function startLifecycle(): () => void {
  const visibility = () => {
    lifecycleEvents.dispatchEvent(new Event(document.hidden ? 'hidden' : 'visible'));
  };
  const pagehide = () => lifecycleEvents.dispatchEvent(new Event('hidden'));
  document.addEventListener('visibilitychange', visibility);
  window.addEventListener('pagehide', pagehide);
  return () => {
    document.removeEventListener('visibilitychange', visibility);
    window.removeEventListener('pagehide', pagehide);
  };
}
