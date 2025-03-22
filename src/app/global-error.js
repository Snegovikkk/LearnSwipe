'use client';

import { useEffect } from 'react';
 
export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Логирование ошибки на сервер
    console.error('Глобальная ошибка приложения:', error);
  }, [error]);
 
  return (
    <html lang="ru">
      <body>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh', 
          backgroundColor: '#f9fafb', 
          padding: '0 1.5rem' 
        }}>
          <div style={{ textAlign: 'center', maxWidth: '28rem' }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              color: '#dc2626', 
              marginBottom: '1rem' 
            }}>
              Критическая ошибка приложения
            </h2>
            <p style={{ 
              color: '#4b5563', 
              marginBottom: '1.5rem' 
            }}>
              Произошла серьезная ошибка при загрузке приложения. Наша команда уведомлена о проблеме.
            </p>
            <button
              onClick={() => reset()}
              style={{ 
                padding: '0.5rem 1rem', 
                backgroundColor: '#dc2626', 
                color: 'white', 
                borderRadius: '0.375rem', 
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', 
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Попробовать перезагрузить
            </button>
          </div>
        </div>
      </body>
    </html>
  );
} 