import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import { Providers } from './providers';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

// Metadata не может быть динамической в клиентском компоненте,
// поэтому мы оставим ее статичной или будем управлять через useEffect.
// Для простоты пока оставим как есть.
export const metadata: Metadata = {
  title: 'Lume — генерация и прохождение тестов онлайн',
  description: 'Lume — платформа для создания и прохождения тестов с помощью искусственного интеллекта. Быстро, удобно, эффективно. Подписка Lume+ для расширенных возможностей.',
  icons: [
    { rel: 'icon', url: '/favicon.png', type: 'image/png' },
    { rel: 'icon', url: '/favicon.ico', type: 'image/x-icon' },
    { rel: 'shortcut icon', url: '/favicon.ico', type: 'image/x-icon' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={`${inter.className} min-h-screen bg-neutral-50 text-neutral-900`}>
        <Providers>
          <Navbar />
          <main>
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
} 