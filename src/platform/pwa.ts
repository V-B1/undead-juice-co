import { registerSW } from 'virtual:pwa-register';
import type { UiRoot } from '../ui/UiRoot';

export function startPwa(ui: UiRoot): void {
  const updateSW = registerSW({
    onNeedRefresh() {
      ui.toast('Fresh juice is ready. Update the game?', {
        duration: 0,
        action: { label: 'Update', run: () => void updateSW(true) },
      });
    },
    onOfflineReady() {
      ui.toast('Ready to play offline');
    },
    onRegisterError() {
      ui.toast('Offline setup could not finish. Reopen while online to try again.');
    },
  });
}
