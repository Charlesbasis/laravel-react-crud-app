import { Database } from 'lucide-react';

export default function AppLogoIcon() {
    return (
        <div className="flex items-center shrink-0">
            <Database className="h-6 w-6 text-blue-600 dark:text-blue-400 sm:h-8 sm:w-8" />
            <span className="ml-2 text-lg font-bold sm:text-xl">ProductManager</span>
        </div>
    );
}
