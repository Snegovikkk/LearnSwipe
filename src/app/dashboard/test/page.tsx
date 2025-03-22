'use client';

import React from 'react';
import Link from 'next/link';

export default function DashboardTest() {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">Тестовая страница</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200 mb-8">
        <p className="text-lg mb-4">
          Это тестовая страница для проверки маршрутизации в разделе Dashboard.
        </p>
        <div className="flex space-x-4">
          <Link 
            href="/dashboard"
            className="px-4 py-2 bg-primary-600 text-white rounded-md shadow-sm hover:bg-primary-700"
          >
            Назад к статистике
          </Link>
        </div>
      </div>
    </div>
  );
} 