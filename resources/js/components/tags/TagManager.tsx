import { useTagManager } from "@/hooks/useTagManager";
import { TagManagementProps } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TagInput } from "./TagInput";
import { Label } from "../ui/label";
import { TagBadge } from "./TagBadge";
import InputError from "../input-error";

export const TagManager = ({
    initialTags,
    onTagsChange,
    availableTags,
    isViewMode = false,
    isSubmitting = false,
    maxTags = 20,
    errors,
}: TagManagementProps) => {
    const {
        tag,
        inputValue,
        filteredAvailableTags,
        addTag,
        removeTag,
        setInputValue,
        clearError,
    } = useTagManager({
        initialTags,
        availableTags,
        maxTags,
        onTagsChange,
    });

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            addTag(inputValue);
            setInputValue("");
        } else if (e.key === "Backspace" && !inputValue && tag.length > 0) {
            removeTag(tag[tag.length - 1]);
        }
    };

    const handleAddTag = () => {
        addTag(inputValue);
    };

    const handleAvailableTagClick = (tag: string) => {
        addTag(tag);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle
                        className="flex items-center justify-between"
                    >
                        Product Tags {tag.length > 0 && `(${tag.length}/${maxTags})`}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!isViewMode && (
                        <TagInput
                            value={inputValue}
                            onChange={setInputValue}
                            onKeyDown={handleKeyDown}
                            onAddTag={handleAddTag}
                            maxTags={maxTags}
                            placeholder="Type a tag and press Enter"
                        />
                    )}

                    <div>
                        <Label className="block text-sm font-medium text-gray-700">
                            Current Tags
                        </Label>
                        {tag.length > 0 ? (
                            <div
                                className="flex flex-wrap gap-2"
                                role="list"
                                aria-label="Current product tags"
                            >
                                {tag.map((tag, index) => (
                                    <TagBadge
                                        key={index}
                                        tag={tag}
                                        onClick={removeTag}
                                        onRemove={removeTag}
                                        variant="selected"
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-gray-500 text-sm p-2 border border-dashed border-gray-300 rounded-md text-center">
                                No tags added yet. {!isViewMode && "Type above and press Enter to add tags."}
                            </div>
                        )}
                    </div>

                    <InputError message={errors?.tag} />
                </CardContent>
            </Card>

            {!isViewMode && availableTags.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            Available Tags ({filteredAvailableTags?.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div
                            className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-md bg-gray-50"
                            role="list"
                            aria-label="Available product tags"
                        >
                            {filteredAvailableTags?.length > 0 ? (
                                filteredAvailableTags?.map((tag: string, index: number) => (
                                    <TagBadge
                                        key={`available-${tag}-${index}`}
                                        tag={tag}
                                        onClick={handleAvailableTagClick}
                                        variant="available"
                                    />
                                ))
                            ) : (
                                <div className="text-gray-500 text-sm p-2 border border-dashed border-gray-300 rounded-md text-center">
                                    No tags available
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Click on any tag to add it to this product
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
