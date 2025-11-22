'use client';

interface SkeletonLoaderProps {
  type: 'table' | 'card' | 'list' | 'line';
  count?: number;
  className?: string;
}

export function SkeletonLoader({
  type,
  count = 5,
  className = '',
}: SkeletonLoaderProps) {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';

  if (type === 'table') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex gap-4 p-4 bg-gray-50 rounded border border-gray-200">
            <div className={`${baseClasses} w-full h-6`}></div>
            <div className={`${baseClasses} w-20 h-6`}></div>
            <div className={`${baseClasses} w-20 h-6`}></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="p-4 bg-white rounded border border-gray-200 space-y-3">
            <div className={`${baseClasses} h-6 w-3/4`}></div>
            <div className={`${baseClasses} h-4 w-full`}></div>
            <div className={`${baseClasses} h-4 w-5/6`}></div>
            <div className="flex gap-2 pt-2">
              <div className={`${baseClasses} h-8 w-20`}></div>
              <div className={`${baseClasses} h-8 w-20`}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`${baseClasses} h-10 w-full`}></div>
        ))}
      </div>
    );
  }

  if (type === 'line') {
    return (
      <div className={`${baseClasses} h-4 w-full ${className}`}></div>
    );
  }

  return null;
}
