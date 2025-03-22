import Link from 'next/link';

export default function NotFound() {
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
          color: '#4f46e5', 
          marginBottom: '1rem' 
        }}>
          Страница не найдена
        </h2>
        <p style={{ 
          color: '#4b5563', 
          marginBottom: '1.5rem' 
        }}>
          Извините, запрашиваемая страница не существует или была перемещена.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Link
            href="/"
            style={{ 
              display: 'inline-block',
              padding: '0.5rem 1rem', 
              backgroundColor: '#4f46e5', 
              color: 'white', 
              borderRadius: '0.375rem', 
              textDecoration: 'none',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            На главную
          </Link>
          <Link
            href="/tests"
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
            Перейти к тестам
          </Link>
        </div>
      </div>
    </div>
  );
} 