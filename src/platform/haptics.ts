export { HAPTICS } from '../config';

export function vibrate(pattern: number | readonly number[], enabled: boolean): void {
  if (enabled && typeof navigator.vibrate === 'function') {
    navigator.vibrate(typeof pattern === 'number' ? pattern : [...pattern]);
  }
}
