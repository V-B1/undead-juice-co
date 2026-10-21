import { BackButton } from '../platform/backButton';
import { h } from './dom';
import { Toast, type ToastOptions } from './Toast';

export class UiRoot {
  readonly back = new BackButton();
  private readonly toasts = h('div', { className: 'toasts', 'aria-live': 'polite' });
  private readonly controls = h('div', { className: 'scene-controls' });

  constructor(root: HTMLElement) {
    root.append(this.toasts, this.controls);
  }

  toast(text: string, options?: ToastOptions): void {
    const toast = new Toast(text, options);
    this.toasts.append(toast.element);
  }

  setSceneAction(label: string, run: () => void, position: 'center' | 'back' = 'center'): void {
    this.controls.className = `scene-controls ${position}`;
    this.controls.replaceChildren(h('button', { type: 'button', onclick: run }, label));
  }

  clearSceneAction(): void {
    this.controls.replaceChildren();
  }

  pulseSceneAction(): void {
    this.controls.querySelector('button')?.classList.add('pulse');
  }
}
