import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react'
import { X } from 'lucide-react'
import { useState } from 'react'
import { Label } from '../ui/label'
import { Button } from '../ui/button'

interface TagComboboxProps {
  initialTags: string[]
  availableTags: string[]
  onTagsChange: (tags: string[]) => void
  isViewMode?: boolean
  isSubmitting?: boolean
  maxTags?: number
  errors?: string
}

export const TagCombobox = ({
  initialTags,
  availableTags,
  onTagsChange,
  isViewMode = false,
  isSubmitting = false,
  maxTags = 20,
  errors,
}: TagComboboxProps) => {
  const [tags, setTags] = useState<string[]>(initialTags)
  const [query, setQuery] = useState('')

  const filteredAvailableTags = availableTags.filter(
    tag => !tags.includes(tag) && tag.toLowerCase().includes(query.toLowerCase())
  )

  const handleAddTag = (newTag: string) => {
    if (isSubmitting || tags.length >= maxTags) return
    
    const trimmedTag = newTag.trim()
    if (!trimmedTag || tags.includes(trimmedTag)) return

    const newTags = [...tags, trimmedTag]
    setTags(newTags)
    onTagsChange(newTags)
    setQuery('') // Clear input after adding
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove)
    setTags(newTags)
    onTagsChange(newTags)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      // Try to add the exact query or the first available option
      if (query.trim()) {
        handleAddTag(query)
      } else if (filteredAvailableTags.length > 0) {
        handleAddTag(filteredAvailableTags[0])
      }
    }
  }

  if (isViewMode) {
    // Return read-only view of tags
    return (
      <div className="space-y-2">
        <Label className="block text-sm font-medium text-gray-700">Product Tags</Label>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {tag}
            </span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Combobox value={null} onChange={(value) => value && handleAddTag(value)}>
        {({ open }) => (
          <>
            <div className="relative">
              <ComboboxInput
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  // Workaround to open options on focus[citation:3][citation:8]
                  if (!open) {
                    // This ensures options are visible when input is focused
                    const Button = document.querySelector('[data-headlessui-state]')
                    Button?.dispatchEvent(new MouseEvent('click'))
                  }
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Type a tag or select from list..."
                disabled={isSubmitting}
              />
            </div>

            <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-fit overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {filteredAvailableTags.length === 0 ? (
                <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                  No tags found. Press Enter to create "{query}"
                </div>
              ) : (
                filteredAvailableTags.map((tag) => (
                  <ComboboxOption
                    key={tag}
                    value={tag}
                    className={({ focus }) =>
                      `relative cursor-default select-none py-2 pl-3 pr-9 ${
                        focus ? 'bg-indigo-600 text-white' : 'text-gray-900'
                      }`
                    }
                  >
                    {tag}
                  </ComboboxOption>
                ))
              )}
            </ComboboxOptions>
          </>
        )}
      </Combobox>

      {/* Display current tags */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-2">
          Current Tags {tags.length > 0 && `(${tags.length}/${maxTags})`}
        </Label>
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {tag}
                <Button
                  onClick={() => handleRemoveTag(tag)}
                  disabled={isSubmitting}
                  className="bg-red-600 cursor-pointer rounded-full w-fit h-fit flex items-center justify-center"
                >
                  <X size={12} />
                </Button>
              </span>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-sm p-2 border border-dashed border-gray-300 rounded-md text-center">
            No tags added yet. Type above and press Enter to add tags.
          </div>
        )}
      </div>

      {errors && <div className="text-red-600 text-sm">{errors}</div>}
    </div>
  )
}
