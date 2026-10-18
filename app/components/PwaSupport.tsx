import { Download, Share, X } from 'lucide-react';
import { useEffect, useState } from 'react';

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const DISMISS_KEY = 'ak-install-dismissed';

/** Registers the service worker and offers to install the site as an app on phones. */
export function PwaSupport() {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    // Only in the production build, so development never runs with stale cached files.
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      navigator.serviceWorker.register('/sw.js').catch((error) => console.warn('Service worker not registered', error));
    }

    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      // storage blocked
    }
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone;
    if (dismissed || standalone) return;

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);

    // iPhone/iPad Safari has no install prompt: show how to add it to the home screen instead.
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent);
    if (ios) setShowIosHint(true);

    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  const dismiss = () => {
    setInstallEvent(null);
    setShowIosHint(false);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // storage blocked
    }
  };

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  };

  if (!installEvent && !showIosHint) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-md items-center gap-3 rounded-2xl border bg-card p-3 shadow-2xl sm:bottom-5">
      <img src="/icons/icon-192.png" alt="" className="h-11 w-11 shrink-0 rounded-xl border" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">ئەپی کتێبخانەکە دابەزێنە</p>
        {installEvent ? (
          <p className="text-xs text-muted-foreground">خێراتر دەکرێتەوە و بێ ئینتەرنێتیش کار دەکات.</p>
        ) : (
          <p className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            کرتە لە <Share className="inline h-3.5 w-3.5" /> بکە، پاشان «Add to Home Screen».
          </p>
        )}
      </div>
      {installEvent && (
        <button
          type="button"
          onClick={install}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          <Download className="h-4 w-4" /> دابەزاندن
        </button>
      )}
      <button type="button" onClick={dismiss} aria-label="داخستن" className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
