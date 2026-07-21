type ServiceWorkerCallbacks = {
  onOfflineReady: () => void;
  onNeedRefresh: (applyUpdate: () => void) => void;
  onRegisterError: (error: unknown) => void;
};

export const registerOfflineServiceWorker = async ({
  onOfflineReady,
  onNeedRefresh,
  onRegisterError,
}: ServiceWorkerCallbacks): Promise<void> => {
  try {
    const hadController = Boolean(navigator.serviceWorker.controller);
    const registration = await navigator.serviceWorker.register(
      `${import.meta.env.BASE_URL}sw.js`,
      { scope: import.meta.env.BASE_URL },
    );
    let offlineAnnounced = false;
    let refreshAnnounced = false;
    let reloadForUpdate = false;

    const announceOfflineReady = () => {
      if (offlineAnnounced) return;
      offlineAnnounced = true;
      onOfflineReady();
    };

    const applyUpdate = () => {
      if (!registration.waiting) return;
      reloadForUpdate = true;
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    };

    const announceRefresh = () => {
      if (refreshAnnounced) return;
      refreshAnnounced = true;
      onNeedRefresh(applyUpdate);
    };

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloadForUpdate) {
        window.location.reload();
      }
    });

    if (registration.waiting) {
      announceRefresh();
    }

    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      if (!worker) return;

      worker.addEventListener('statechange', () => {
        if (worker.state !== 'installed') return;

        if (hadController || navigator.serviceWorker.controller) {
          announceRefresh();
        } else {
          announceOfflineReady();
        }
      });
    });

    if (!hadController) {
      await navigator.serviceWorker.ready;
      announceOfflineReady();
    }
  } catch (error) {
    onRegisterError(error);
  }
};
