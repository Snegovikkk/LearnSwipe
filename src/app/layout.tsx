import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

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
          <footer className="py-8 text-center text-neutral-500 text-sm mt-auto">
            <div className="container mx-auto px-4">
              <p>&copy; {new Date().getFullYear()} Lume. Все права защищены.</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
} 