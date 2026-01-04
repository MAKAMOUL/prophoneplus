import { RefreshCw } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export default function LoadingSpinner({
  size = 'md',
  message,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <RefreshCw
        className={`${sizeClasses[size]} text-blue-600 animate-spin`}
      />
      {message && <p className="mt-3 text-gray-500 text-sm">{message}</p>}
    </div>
  );
}
