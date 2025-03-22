import React from 'react';

const StatCardSkeleton = () => (
  <div className="p-4 border border-neutral-200 rounded-lg animate-pulse">
    <div className="flex justify-between items-start mb-2">
      <div>
        <div className="h-5 bg-neutral-200 rounded w-28 mb-2"></div>
        <div className="h-3 bg-neutral-200 rounded w-20"></div>
      </div>
      <div className="w-10 h-10 rounded-full bg-neutral-200"></div>
    </div>
    <div className="flex items-end mt-4">
      <div className="h-8 bg-neutral-200 rounded w-12 mr-2"></div>
      <div className="h-4 bg-neutral-200 rounded w-12 mb-1"></div>
    </div>
    <div className="w-full bg-neutral-200 rounded-full h-2 mt-2"></div>
  </div>
);

const ChartSkeleton = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200 mb-8 animate-pulse">
    <div className="h-6 bg-neutral-200 rounded w-48 mb-6"></div>
    <div className="h-48 bg-neutral-200 rounded w-full"></div>
  </div>
);

export default function DashboardLoading() {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">Моя статистика</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200 mb-8">
        <div className="h-6 bg-neutral-200 rounded w-64 mb-4 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      </div>
      
      <ChartSkeleton />
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200 mb-8">
        <div className="h-6 bg-neutral-200 rounded w-48 mb-6 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 bg-neutral-200 rounded animate-pulse"></div>
          <div className="h-48 bg-neutral-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
} 