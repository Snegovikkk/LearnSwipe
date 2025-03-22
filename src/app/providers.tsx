'use client';

import { ReactNode, useEffect, useState } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // Этот эффект гарантирует, что компоненты будут визуализироваться только после полной гидратации на клиенте
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Загрузка приложения...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Если компоненты не гидратированы, мы возвращаем пустой экран */}
      {!mounted && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      )}
      {/* Когда компоненты гидратированы, отображаем их */}
      <div className={mounted ? '' : 'hidden'}>
        {children}
      </div>
    </>
  );
} 