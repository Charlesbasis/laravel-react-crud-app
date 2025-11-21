import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface LinkProps {
    active: boolean;
    label: string;
    url: string | null;
}

export interface Product {
    id: number;
    name: string;
    description: string;
    image: string;
    price: number;
    created_at: string;
    tag: string | string[];
}

export interface ProductPagination {
    data: Product[];
    links: LinkProps[];
    from: number;
    to: number;
    total: number;
}

export interface FilterProps {
    search?: string;
    sort?: string;
    direction?: string;
    min_price?: string;
    max_price?: string;
}

export interface IndexProps {
    products: ProductPagination;
    filters: FilterProps;
}

export interface PaginationData {
    links: LinkProps[];
    from: number;
    to: number;
    total: number;
}

type SortDirection = 'asc' | 'desc';
type SortField = 'name' | 'description' | 'price' | 'created_at' | 'tag';

export interface SortProps {
    field: SortField;
    direction: SortDirection;
}

export interface PriceFilterProps {
    min_price?: string;
    max_price?: string;
    onPriceChange: (min_price: string, max_price: string) => void;
    className?: string;
}
