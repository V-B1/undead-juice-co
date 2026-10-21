export interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export const safeAreaEvents = new EventTarget();
let current: Insets = { top: 0, right: 0, bottom: 0, left: 0 };

export function insets(): Readonly<Insets> {
  return current;
}

export function startSafeArea(): () => void {
  const probe = document.createElement('div');
  probe.setAttribute('aria-hidden', 'true');
  probe.style.cssText =
    'position:fixed;visibility:hidden;pointer-events:none;' +
    'padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';
  document.body.append(probe);
  const measure = () => {
    const css = getComputedStyle(probe);
    const next = {
      top: parseFloat(css.paddingTop) || 0,
      right: parseFloat(css.paddingRight) || 0,
      bottom: parseFloat(css.paddingBottom) || 0,
      left: parseFloat(css.paddingLeft) || 0,
    };
    if (Object.keys(next).some((key) => next[key as keyof Insets] !== current[key as keyof Insets])) {
      current = next;
      safeAreaEvents.dispatchEvent(new Event('change'));
    }
  };
  measure();
  window.addEventListener('resize', measure);
  window.visualViewport?.addEventListener('resize', measure);
  return () => {
    window.removeEventListener('resize', measure);
    window.visualViewport?.removeEventListener('resize', measure);
    probe.remove();
  };
}
