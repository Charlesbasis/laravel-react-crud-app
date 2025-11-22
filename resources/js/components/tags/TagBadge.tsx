import { cn } from "@/lib/utils";
import { TagBadgeProps } from "@/types";
import { X } from "lucide-react";

export const TagBadge = ({ tag, onClick, onRemove, variant = 'default', disabled = false }: TagBadgeProps) => {

    const baseStyles = "inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium transition-all duration-200";

    const variants = {
        default: baseStyles + " bg-gray-200 text-gray-800 hover:bg-gray-300",
        selected: baseStyles + " bg-green-500 text-white hover:bg-green-600",
        available: baseStyles + " bg-gray-200 text-gray-800 hover:bg-gray-300 cursor-pointer",
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        if (onClick && !disabled) {
            onClick(tag);
        }
    };

    const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        if (onRemove && !disabled) {
            onRemove(tag);
        }
    };

    return (
        <span className={cn(
            variants[variant],
            baseStyles,
            onclick && !disabled && "cursor-pointer",
            disabled && "cursor-not-allowed opacity-50",
            )}
            onClick={handleClick}
            role={onClick ? "button" : undefined}
            tabIndex={onClick && !disabled ? 0 : undefined}
            onKeyDown={onClick && !disabled ? (e) => e.stopPropagation() : undefined}
        >
            <span className="max-w-[120px] truncate" title={tag}>{tag}</span>
            {onRemove && (
                <button
                    type="button"
                    className="ml-1 bg-transparent hover:bg-red-500 hover:text-white text-red-500 cursor-pointer p-1 rounded"
                    onClick={handleRemove}
                    aria-label={`Remove ${tag}`}
                    title={`Remove ${tag}`}
                >
                    <X size={12} />
                </button>
            )}
        </span>        
    );
};
