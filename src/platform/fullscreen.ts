import { lockLandscape } from './orientation';

export function requestFullscreen(): void {
  const ios =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches;
  if (ios || standalone || document.fullscreenElement || !document.fullscreenEnabled) return;
  void document.body
    .requestFullscreen({ navigationUI: 'hide' })
    .then(() => lockLandscape())
    .catch(() => {});
}
