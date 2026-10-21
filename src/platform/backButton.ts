export class BackButton {
  private readonly stack: (() => void)[] = [];
  private readonly pop = () => {
    const close = this.stack.pop();
    close?.();
    if (this.stack.length === 0) this.guardBase();
  };

  constructor() {
    this.guardBase();
    window.addEventListener('popstate', this.pop);
  }

  private guardBase(): void {
    // Keep Android back on the app when no panel is open.
    history.pushState({ ujc: true }, '', location.href);
  }

  push(close: () => void): void {
    this.stack.push(close);
    history.pushState({ ujc: true, depth: this.stack.length }, '', location.href);
  }

  back(): void {
    if (this.stack.length > 0) history.back();
  }

  destroy(): void {
    window.removeEventListener('popstate', this.pop);
    this.stack.length = 0;
  }
}
