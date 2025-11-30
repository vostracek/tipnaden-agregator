'use client';

import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';

interface ErrorFallbackProps {
  error: Error | null;
  resetError: () => void;
}

/**
 * ErrorFallback Component
 * UI komponenta která se zobrazí když Error Boundary zachytí error
 */
export default function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
    resetError();
  };

  const handleRefresh = () => {
    resetError();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-slate-800/50 border-slate-700 p-8">
        <div className="text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <AlertTriangle 
                className="text-red-500 animate-pulse" 
                size={80} 
                strokeWidth={1.5}
              />
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-white mb-4">
            Jejda! Něco se pokazilo
          </h1>

          {/* Description */}
          <p className="text-slate-300 text-lg mb-8">
            Omlouváme se, ale narazili jsme na neočekávanou chybu.
            Náš tým byl automaticky upozorněn a pracujeme na nápravě.
          </p>

          {/* Error Details (pouze v development) */}
          {process.env.NODE_ENV === 'development' && error && (
            <div className="mb-8 text-left">
              <details className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <summary className="text-red-400 font-mono text-sm cursor-pointer hover:text-red-300 transition-colors">
                  Detaily chyby (pouze pro vývojáře)
                </summary>
                <div className="mt-4 space-y-2">
                  <div>
                    <p className="text-slate-400 text-xs font-semibold mb-1">
                      Error Message:
                    </p>
                    <p className="text-red-400 font-mono text-sm break-all">
                      {error.message}
                    </p>
                  </div>
                  {error.stack && (
                    <div>
                      <p className="text-slate-400 text-xs font-semibold mb-1 mt-3">
                        Stack Trace:
                      </p>
                      <pre className="text-slate-300 font-mono text-xs overflow-x-auto bg-slate-950 p-3 rounded border border-slate-800">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRefresh}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-blue-500/50"
            >
              <RefreshCw size={20} />
              Zkusit znovu
            </button>

            <button
              onClick={handleGoHome}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-all duration-200 hover:scale-105"
            >
              <Home size={20} />
              Zpět na hlavní stránku
            </button>
          </div>

          {/* Help Text */}
          <p className="text-slate-400 text-sm mt-8">
            Pokud problém přetrvává, kontaktujte nás na{' '}
            <a 
              href="mailto:podpora@tipnaden.cz" 
              className="text-blue-400 hover:text-blue-300 underline"
            >
              podpora@tipnaden.cz
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}