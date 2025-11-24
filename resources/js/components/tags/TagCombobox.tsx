import { useTagManager } from "@/hooks/useTagManager";
import { TagComboboxProps } from "@/types";
import InputError from "../input-error";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { TagBadge } from "./TagBadge";
import { TagInput } from "./TagInput";
import { useState } from "react";
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";

export const TagCombobox = ({
    initialTags,
    onTagsChange,
    availableTags,
    isViewMode = false,
    isSubmitting = false,
    maxTags = 20,
    errors,
}: TagComboboxProps) => {



    // if (isViewMode) {
    //     return (
    //         <div className="space-y-2">
    //             <Label className="block text-sm font-medium text-gray-700">
    //                 Product Tags
    //             </Label>
    //             <div className="flex flex-wrap gap-2">
    //                 {tags.map(tag, index) => (
    //                 <span
    //                     key={index}
    //                     className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium transition-all duration-200"
    //                 >
    //                     {tag}
    //                 </span>                
    //                 ))}
    //             </div>
    //         </div>
    //     );
    // }

    // return (
    //     <div className="space-y-4">
    //         <Combobox value={null} onChange={(value) => value && handleAddTag(value)}>
    //             {({ open }) => (
    //                 <>
    //                     <div className="relative">
    //                         <ComboboxInput
    //                             value={query}
    //                             onChange={(e) => setQuery(e.target.value)}
    //                             onKeyDown={handleKeyDown}
    //                             onFocus={() => {
    //                                 if (!open) {
    //                                     const button = document.querySelector('[data-headlessui-state]')
    //                                     button?.dispatchEvent(new MouseEvent('click'))
    //                                 }
    //                             }}
    //                             className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
    //                             placeholder="Type a tag or select from available tags"
    //                             disabled={isSubmitting}
    //                         />
    //                     </div>

    //                     <ComboboxOptions
    //                         className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
    //                         {filteredAvailableTags.length === 0 ? (
    //                             <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
    //                                 No tags found. Press enter to create "{query}"
    //                             </div>
    //                         ) : (
    //                             filteredAvailableTags.map((tag, index) => (
    //                                 <ComboboxOption
    //                                     key={tag}
    //                                     value={tag}
    //                                     className={({ foucs }) =>
    //                                         `relative cursor-default select-none py-2 pl-10 pr-4 ${foucs ? 'bg-indigo-600 text-white' : 'text-gray-900'}`
    //                                     }
    //                                 >
    //                                     {tag}
    //                                 </ComboboxOption>
    //                             ))
    //                         )}
    //                         </ComboboxOptions>
    //         </>
    //                         )}
    //     </Combobox>
    // const {
    //     tag,
    //     inputValue,
    //     filteredAvailableTags,
    //     addTag,
    //     removeTag,
    //     setInputValue,
    //     clearError,
    // } = useTagManager({
    //     initialTags,
    //     availableTags,
    //     maxTags,
    //     onTagsChange,
    // });

    // const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    //     if (e.key === "Enter") {
    //         addTag(inputValue);
    //         setInputValue("");
    //     } else if (e.key === "Backspace" && !inputValue && tag.length > 0) {
    //         removeTag(tag[tag.length - 1]);
    //     }
    // };

    // const handleAddTag = () => {
    //     addTag(inputValue);
    // };

    // const handleAvailableTagClick = (tag: string) => {
    //     addTag(tag);
    // };

    // return (
    //     <div className="space-y-6">
    //         <Card>
    //             <CardHeader>
    //                 <CardTitle
    //                     className="flex items-center justify-between"
    //                 >
    //                     Product Tags {tag.length > 0 && `(${tag.length}/${maxTags})`}
    //                 </CardTitle>
    //             </CardHeader>
    //             <CardContent className="space-y-6">
    //                 {!isViewMode && (
    //                     <TagInput
    //                         value={inputValue}
    //                         onChange={setInputValue}
    //                         onKeyDown={handleKeyDown}
    //                         onAddTag={handleAddTag}
    //                         maxTags={maxTags}
    //                         placeholder="Type a tag and press Enter"
    //                     />
    //                 )}

    //                 <div>
    //                     <Label className="block text-sm font-medium text-gray-700">
    //                         Current Tags
    //                     </Label>
    //                     {tag.length > 0 ? (
    //                         <div
    //                             className="flex flex-wrap gap-2"
    //                             role="list"
    //                             aria-label="Current product tags"
    //                         >
    //                             {tag.map((tag, index) => (
    //                                 <TagBadge
    //                                     key={index}
    //                                     tag={tag}
    //                                     onClick={removeTag}
    //                                     onRemove={removeTag}
    //                                     variant="selected"
    //                                 />
    //                             ))}
    //                         </div>
    //                     ) : (
    //                         <div className="text-gray-500 text-sm p-2 border border-dashed border-gray-300 rounded-md text-center">
    //                             No tags added yet. {!isViewMode && "Type above and press Enter to add tags."}
    //                         </div>
    //                     )}
    //                 </div>

    //                 <InputError message={errors?.tag} />
    //             </CardContent>
    //         </Card>

    //         {!isViewMode && availableTags.length > 0 && (
    //             <Card>
    //                 <CardHeader>
    //                     <CardTitle className="flex items-center justify-between">
    //                         Available Tags ({filteredAvailableTags?.length})
    //                     </CardTitle>
    //                 </CardHeader>
    //                 <CardContent className="space-y-6">
    //                     <div
    //                         className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-md bg-gray-50"
    //                         role="list"
    //                         aria-label="Available product tags"
    //                     >
    //                         {filteredAvailableTags?.length > 0 ? (
    //                             filteredAvailableTags?.map((tag: string, index: number) => (
    //                                 <TagBadge
    //                                     key={`available-${tag}-${index}`}
    //                                     tag={tag}
    //                                     onClick={handleAvailableTagClick}
    //                                     variant="available"
    //                                 />
    //                             ))
    //                         ) : (
    //                             <div className="text-gray-500 text-sm p-2 border border-dashed border-gray-300 rounded-md text-center">
    //                                 No tags available
    //                             </div>
    //                         )}
    //                     </div>
    //                     <p className="text-xs text-gray-500 mt-2">
    //                         Click on any tag to add it to this product
    //                     </p>
    //                 </CardContent>
    //             </Card>
    //         )}
    //     </div>
    // );
}
