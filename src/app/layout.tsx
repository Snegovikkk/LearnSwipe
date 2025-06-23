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
  title: 'Lume - Платформа для создания и прохождения тестов',
  description: 'Создавайте тесты с использованием ИИ, делитесь ими и улучшайте свои знания',
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