'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function DashboardError({ error, reset }) {
  useEffect(() => {
    // Логирование ошибки на сервер
    console.error('Ошибка в Дашборде:', error);
  }, [error]);

  return (
    <div style={{ 
      maxWidth: '80rem', 
      margin: '0 auto', 
      padding: '2rem 1rem' 
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '1.5rem', 
        borderRadius: '0.5rem', 
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', 
        border: '1px solid #e5e7eb', 
        marginBottom: '2rem' 
      }}>
        <h1 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          color: '#dc2626', 
          marginBottom: '1rem' 
        }}>
          Ошибка при загрузке статистики
        </h1>
        <p style={{ 
          color: '#4b5563', 
          marginBottom: '1.5rem' 
        }}>
          К сожалению, не удалось загрузить вашу статистику. Это может быть связано с временными проблемами сервера.
        </p>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.75rem',
          '@media (min-width: 640px)': {
            flexDirection: 'row'
          }
        }}>
          <button
            onClick={() => reset()}
            style={{ 
              padding: '0.5rem 1rem', 
              backgroundColor: '#4f46e5', 
              color: 'white', 
              borderRadius: '0.375rem', 
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Попробовать снова
          </button>
          <Link
            href="/tests"
            style={{ 
              padding: '0.5rem 1rem', 
              border: '1px solid #d1d5db',
              color: '#374151', 
              borderRadius: '0.375rem', 
              textAlign: 'center',
              textDecoration: 'none'
            }}
          >
            Перейти к тестам
          </Link>
        </div>
      </div>
    </div>
  );
} 