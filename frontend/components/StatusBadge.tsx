'use client';

interface StatusBadgeProps {
  available: number;
  budget: number;
  size?: 'sm' | 'md' | 'lg';
}

type Status = 'ok' | 'warning' | 'danger';

export default function StatusBadge({ available, budget, size = 'md' }: StatusBadgeProps) {
  const percentage = (available / budget) * 100;

  let status: Status;
  let label: string;
  let bgColor: string;
  let textColor: string;

  if (available < 0) {
    status = 'danger';
    label = 'Excedido';
    bgColor = 'bg-red-100';
    textColor = 'text-red-800';
  } else if (percentage < 10) {
    status = 'warning';
    label = 'Precaución';
    bgColor = 'bg-amber-100';
    textColor = 'text-amber-800';
  } else {
    status = 'ok';
    label = 'OK';
    bgColor = 'bg-green-100';
    textColor = 'text-green-800';
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${bgColor} ${textColor} ${sizeClasses[size]}`}
    >
      {status === 'danger' && <span className="mr-1">🔴</span>}
      {status === 'warning' && <span className="mr-1">🟠</span>}
      {status === 'ok' && <span className="mr-1">🟢</span>}
      {label}
    </span>
  );
}
