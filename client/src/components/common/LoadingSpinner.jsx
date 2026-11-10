import React from 'react';

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size] || sizeClasses.md} rounded-full border-emerald-500 border-t-transparent animate-spin`}
        role="status"
        aria-label="loading"
      />
    </div>
  );
};

export const FullPageLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
          Loading SpendWise...
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;

