import { InertiaLinkProps } from '@inertiajs/react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function isSameUrl(
    url1: NonNullable<InertiaLinkProps['href']>,
    url2: NonNullable<InertiaLinkProps['href']>,
) {
    return resolveUrl(url1) === resolveUrl(url2);
}

export function resolveUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

export const normalizeTag = (tag: string) => tag.trim().toLowerCase();

export const generateTagSlug = (tag: string) => {
    return tag
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export const validateTagName = (tag: string) : { isValid: boolean, errors: string[] } => {
    const errors: string[] = [];

    if (!tag.trim()) {
        errors.push("Tag cannot be empty");
    }

    if (tag.length > 50) {
        errors.push("Tag cannot be longer than 20 characters");
    }

    if (!/^[a-z0-9-_]+$/i.test(tag.trim())) {
        errors.push("Tag can only contain letters, numbers, dashes, and underscores");
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}
