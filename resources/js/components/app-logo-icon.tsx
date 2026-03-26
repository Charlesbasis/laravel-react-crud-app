import { cn } from '@/lib/utils';
import { Database, type LucideProps } from 'lucide-react';

export default function AppLogoIcon(props: LucideProps) {
    return (
        <Database
            strokeWidth={2.25}
            {...props}
            className={cn('size-5', props.className)}
        />
    );
}
