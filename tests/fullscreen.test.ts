import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { requestFullscreen } from '../src/platform/fullscreen';

describe('requestFullscreen', () => {
  const request = vi.fn<() => Promise<void>>();
  const lock = vi.fn<() => Promise<void>>();

  beforeEach(() => {
    request.mockReset().mockResolvedValue(undefined);
    lock.mockReset().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { userAgent: 'Chrome', platform: 'Win32', maxTouchPoints: 0 });
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    vi.stubGlobal('document', {
      fullscreenEnabled: true,
      fullscreenElement: null,
      body: { requestFullscreen: request },
    });
    vi.stubGlobal('screen', { orientation: { lock } });
  });

  afterEach(() => vi.unstubAllGlobals());

  it('handles a refused fullscreen request without an unhandled rejection', async () => {
    request.mockRejectedValue(new TypeError('not granted'));
    expect(requestFullscreen()).toBeUndefined();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(request).toHaveBeenCalledOnce();
    expect(lock).not.toHaveBeenCalled();
  });

  it('locks landscape only after fullscreen is granted', async () => {
    let grant!: () => void;
    const granted = new Promise<void>((resolve) => {
      grant = resolve;
    });
    request.mockReturnValue(granted);
    requestFullscreen();
    expect(request).toHaveBeenCalledWith({ navigationUI: 'hide' });
    expect(lock).not.toHaveBeenCalled();
    grant();
    await granted;
    expect(lock).toHaveBeenCalledWith('landscape');
  });

  it.each(['ios', 'ipad_desktop', 'standalone', 'already_fullscreen', 'unsupported'])(
    'skips requesting fullscreen for %s',
    (mode) => {
      if (mode === 'ios') vi.stubGlobal('navigator', { userAgent: 'iPhone' });
      if (mode === 'ipad_desktop') {
        vi.stubGlobal('navigator', { userAgent: 'Safari', platform: 'MacIntel', maxTouchPoints: 5 });
      }
      if (mode === 'standalone') vi.stubGlobal('matchMedia', () => ({ matches: true }));
      if (mode === 'already_fullscreen' || mode === 'unsupported') {
        vi.stubGlobal('document', {
          fullscreenEnabled: mode !== 'unsupported',
          fullscreenElement: mode === 'already_fullscreen' ? {} : null,
          body: { requestFullscreen: request },
        });
      }
      requestFullscreen();
      expect(request).not.toHaveBeenCalled();
      expect(lock).not.toHaveBeenCalled();
    },
  );
});
