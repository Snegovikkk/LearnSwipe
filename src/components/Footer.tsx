import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-neutral-50 border-t mt-12 py-8 px-4 text-sm text-neutral-700">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between gap-8 text-center">
        <div>
          <h3 className="font-bold mb-2">О нас</h3>
          <ul>
            <li><Link href="/about" className="hover:underline">О проекте</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-2">Информация</h3>
          <ul>
            <li><Link href="/privacy" className="hover:underline">Политика конфиденциальности</Link></li>
            <li><Link href="/terms" className="hover:underline">Пользовательское соглашение</Link></li>
            <li><Link href="/offer" className="hover:underline">Договор оферта</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-2">Пользователям</h3>
          <ul>
            <li><Link href="/faq" className="hover:underline">Вопрос-ответ (FAQ)</Link></li>
            <li><a href="https://t.me/lumeswipe" target="_blank" rel="noopener noreferrer" className="hover:underline text-primary-600">Обратная связь</a></li>
          </ul>
        </div>
      </div>
      <div className="mt-8 text-center text-neutral-400 text-xs">© {new Date().getFullYear()} Lume. Все права защищены.</div>
    </footer>
  );
} 