import React, { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="inline-flex items-center gap-1.5 min-h-[40px] px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold tracking-tight shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        aria-label="Zainstaluj aplikację PWA"
      >
        <Download className="w-4 h-4 shrink-0" />
        <span>Instaluj PWA</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 min-h-[40px] px-3 py-1.5 rounded-xl border border-blue-800/30 dark:border-amber-400/40 text-blue-900 dark:text-amber-300 text-xs font-semibold hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Share className="w-3.5 h-3.5 shrink-0" />
          <span>Na ekran główny</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Instalacja na iPhone / iPad
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Zamknij"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ol className="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-300 list-decimal list-inside">
                <li>
                  Naciśnij ikonę <strong>Udostępnij</strong> na pasku Safari.
                </li>
                <li>
                  Przewiń w dół i wybierz <strong>Do ekranu początkowego</strong>.
                </li>
                <li>
                  Potwierdź <strong>Dodaj</strong>, aby korzystać offline na szlaku.
                </li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full min-h-[44px] rounded-xl bg-blue-900 dark:bg-amber-400 text-white dark:text-slate-950 font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Rozumiem
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
