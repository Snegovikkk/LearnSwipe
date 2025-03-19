'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaList, FaUser, FaPlus } from 'react-icons/fa';

export default function Header() {
  const pathname = usePathname();
  
  return (
    <nav className="bottom-nav safe-bottom">
      <div className="bottom-nav-inner">
        <Link href="/" className={`nav-item ${pathname === '/' ? 'active' : ''}`}>
          <FaHome className="nav-icon" />
          <span>Главная</span>
        </Link>
        
        <Link href="/tests" className={`nav-item ${pathname === '/tests' ? 'active' : ''}`}>
          <FaList className="nav-icon" />
          <span>Тесты</span>
        </Link>
        
        <Link href="/create" className={`nav-item ${pathname === '/create' ? 'active' : ''}`}>
          <FaPlus className="nav-icon" />
          <span>Создать</span>
        </Link>
        
        <Link href="/profile" className={`nav-item ${pathname === '/profile' ? 'active' : ''}`}>
          <FaUser className="nav-icon" />
          <span>Профиль</span>
        </Link>
      </div>
    </nav>
  );
}