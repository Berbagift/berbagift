import { SearchX } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({ 
  title = "No rooms found", 
  description = "We couldn't find any rooms matching your current filters." 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-16 h-16 bg-neutral-3 rounded-full flex items-center justify-center mb-4 text-neutral-6">
        <SearchX className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-semibold text-black dark:text-neutral-1 mb-2">{title}</h3>
      <p className="text-neutral-7 dark:text-neutral-6 max-w-md mx-auto">{description}</p>
    </div>
  );
}
