import React from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="bg-neutral-50 min-h-screen">
      {children}
    </section>
  );
} 