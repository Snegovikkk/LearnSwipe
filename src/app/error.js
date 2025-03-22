'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Логирование ошибки на сервер
    console.error('Ошибка приложения:', error);
  }, [error]);

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '70vh', 
      padding: '0 1.5rem' 
    }}>
      <div style={{ textAlign: 'center', maxWidth: '28rem' }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          color: '#dc2626', 
          marginBottom: '1rem' 
        }}>
          Произошла ошибка
        </h2>
        <p style={{ 
          color: '#4b5563', 
          marginBottom: '1.5rem' 
        }}>
          Извините, что-то пошло не так при загрузке страницы. Наша команда уведомлена о проблеме.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={() => reset()}
            style={{ 
              padding: '0.5rem 1rem', 
              backgroundColor: '#4f46e5', 
              color: 'white', 
              borderRadius: '0.375rem', 
              border: 'none',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            Попробовать снова
          </button>
          <Link
            href="/"
            style={{ 
              display: 'inline-block',
              padding: '0.5rem 1rem', 
              border: '1px solid #d1d5db',
              color: '#374151', 
              borderRadius: '0.375rem', 
              textDecoration: 'none',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
} 