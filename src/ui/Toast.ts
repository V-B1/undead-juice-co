import { TOAST_MS } from '../config';
import { h } from './dom';

export interface ToastOptions {
  duration?: number;
  action?: { label: string; run: () => void };
}

export class Toast {
  readonly element: HTMLDivElement;
  private timer?: ReturnType<typeof setTimeout>;

  constructor(text: string, options: ToastOptions = {}) {
    this.element = h('div', { className: 'toast', role: 'status' }, h('span', {}, text));
    if (options.action) {
      const action = options.action;
      this.element.append(
        h(
          'button',
          {
            type: 'button',
            onclick: () => {
              action.run();
              this.destroy();
            },
          },
          action.label,
        ),
      );
    }
    const duration = options.duration ?? TOAST_MS;
    if (duration > 0) this.timer = setTimeout(() => this.destroy(), duration);
  }

  destroy(): void {
    clearTimeout(this.timer);
    this.element.remove();
  }
}
