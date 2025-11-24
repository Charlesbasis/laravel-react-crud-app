import { TagInputProps } from "@/types";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import InputError from "../input-error";

export const TagInput = ({ 
    onChange, 
    value, 
    placeholder, 
    disabled = false, 
    maxTags = 20, 
    onAddTag, 
    onKeyDown 
}: TagInputProps) => {

    const handleSubmit = () => {
        if (onAddTag) {
            onAddTag(value);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <div className="flex-1">
                    <Input
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={onKeyDown}
                        type="text"
                        className={cn(
                            "flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        )}
                        placeholder={placeholder}
                        disabled={disabled}
                        // aria-describedby={error ? "tag-error" : undefined}
                        // aria-invalid={!!error}
                    />
                </div>
                <button
                    type="button"
                    onClick={handleSubmit}
                    className="rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500"
                    disabled={disabled || !value.trim()}
                    variant="secondary"
                >
                    Add Tag
                </button>
            </div>
            {/* <InputError message={errors?.message} /> */}
            <div className="flex justify-between text-sm text-gray-500">
                <span>{value.length} of {maxTags} tags</span>
                <span>Press Enter to add tags</span>
            </div>
        </div>
    );
};
