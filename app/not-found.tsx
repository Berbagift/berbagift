import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full border border-neutral-4 dark:border-border rounded-md p-10 bg-white dark:bg-card flex flex-col items-center shadow-sm">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
          <i className="fi fi-rr-search text-2xl" />
        </div>
        <h1 className="text-2xl font-semibold text-black dark:text-neutral-1 mb-2">
          Page Not Found
        </h1>
        <p className="text-neutral-7 dark:text-neutral-6 mb-8 max-w-xs">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link href="/dashboard" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto px-8 rounded-md font-medium">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
