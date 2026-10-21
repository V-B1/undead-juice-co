export class FakeClock {
  constructor(private time = 0) {}
  now(): number {
    return this.time;
  }
  set(time: number): void {
    this.time = time;
  }
  advance(delta: number): void {
    this.time += delta;
  }
}
