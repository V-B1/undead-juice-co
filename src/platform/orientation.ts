export const orientationEvents = new EventTarget();

export async function lockLandscape(): Promise<void> {
  const orientation = screen.orientation;
  if (!orientation) return;
  if ('lock' in orientation && typeof orientation.lock === 'function') {
    try {
      await orientation.lock('landscape');
    } catch {
      // Browsers may disallow locks; the rotate overlay remains available.
    }
  }
}

export function startOrientation(overlay: HTMLElement): () => void {
  const portrait = matchMedia('(orientation: portrait)');
  const update = () => {
    overlay.hidden = !portrait.matches;
    orientationEvents.dispatchEvent(new Event(portrait.matches ? 'pause' : 'landscape'));
  };
  const onFullscreen = () => {
    if (document.fullscreenElement) void lockLandscape();
  };
  portrait.addEventListener('change', update);
  document.addEventListener('fullscreenchange', onFullscreen);
  update();
  return () => {
    portrait.removeEventListener('change', update);
    document.removeEventListener('fullscreenchange', onFullscreen);
  };
}
