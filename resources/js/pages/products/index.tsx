import {
    create as productsCreate,
    destroy as productsDestroy,
    edit as productsEdit,
    index as productsIndex,
    show as productsShow
} from '@/actions/App/Http/Controllers/ProductController';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { PriceFilter } from '@/components/ui/price-filter';
import { SortableHeader } from '@/components/ui/sortable-header';
import AppLayout from '@/layouts/app-layout';
import { SortField, SortProps, type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, MoreHorizontal, Pencil, Trash, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manage Products',
        href: productsIndex().url,
    },
];

export default function Index() {
    const { props } = usePage<PageProps>();
    const { products, filters } = props;

    const initialFilters = useRef(props.filters);
    const [localSearch, setLocalSearch] = useState(initialFilters.current.search || '');
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const requestInProgress = useRef(false);

    const [sortConfig, setSortConfig] = useState<SortProps>({
        field: 'created_at',
        direction: 'asc'
    });

    const previousProducts = useRef(products);
    const previousFilters = useRef(filters);

    const [localMinPrice, setLocalMinPrice] = useState(initialFilters.current.min_price || '');
    const [localMaxPrice, setLocalMaxPrice] = useState(initialFilters.current.max_price || '');

    const executeSearchFilter = useCallback((value: string) => {
        if (requestInProgress.current) return;

        requestInProgress.current = true;

        const queryParams: any = {
            search: value,
            sort: sortConfig.field,
            direction: sortConfig.direction
        };

        Object.keys(queryParams).forEach((key) => {
            if (queryParams[key] === undefined) {
                delete queryParams[key];
            }
        });

        // console.log('Sorting Request', queryParams)
        router.get(productsIndex().url, queryParams, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
            onFinish: () => {
                requestInProgress.current = false;
            },
        });
    }, [sortConfig, requestInProgress, localMinPrice, localMaxPrice]);

    const executePriceFilter = useCallback((min_price: string, max_price: string) => {
        if (requestInProgress.current) return;

        requestInProgress.current = true;

        const queryParams: any = {
            min_price: min_price,
            max_price: max_price,
            sort: sortConfig.field,
            direction: sortConfig.direction
        };

        Object.keys(queryParams).forEach((key) => {
            if (queryParams[key] === undefined) {
                delete queryParams[key];
            }
        });

        // console.log('Price Filtering Request', queryParams)
        router.get(productsIndex().url, queryParams, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
            onFinish: () => {
                requestInProgress.current = false;
            },
        });
    }, [sortConfig, requestInProgress, localSearch]);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // console.log('⌨️ Input changed:', value);
        setLocalSearch(value);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            executeSearchFilter(value);
        }, 500);
    }, [executeSearchFilter]);

    const handlePriceChange = useCallback((min_price: string, max_price: string) => {

        // console.log('🔢 Price changed:', min_price, max_price);
        setLocalMinPrice(min_price);
        setLocalMaxPrice(max_price);
        executePriceFilter(min_price, max_price);
    }, [executePriceFilter]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            // console.log('⏹️ Prevented form submission on Enter');

            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
            executeFilter(localSearch, localMinPrice, localMaxPrice);
        }
    }, [localSearch, localMinPrice, localMaxPrice, executeSearchFilter, executePriceFilter]);

    useEffect(() => {
        const productsChanged =
            previousProducts.current.data.length !== products.data.length ||
            previousProducts.current.current_page !== products.current_page;

        const filtersChanged = previousFilters.current.search !== filters.search;

        if (productsChanged || filtersChanged) {
            // console.log('📦 Products updated:', {
            //     items: products.data.length,
            //     page: products.current_page,
            //     search: filters.search
            // });

            previousProducts.current = products;
            previousFilters.current = filters;
        }
    }, [products, filters]);

    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    const handleSort = useCallback((field: SortField) => {
        if (requestInProgress.current) return;

        let newDirection: SortProps['direction'] = 'asc';
        if (sortConfig.field === field) {
            newDirection = sortConfig.direction === 'asc' ? 'desc' : 'asc';
        }

        const newSortConfig: SortProps = {
            field,
            direction: newDirection
        };

        setSortConfig(newSortConfig);

        requestInProgress.current = true;

        const queryParams: any = {
            search: localSearch,
            sort: newSortConfig.field,
            direction: newSortConfig.direction,
            min_price: localMinPrice,
            max_price: localMaxPrice,
        };

        Object.keys(queryParams).forEach((key) => {
            if (queryParams[key] === undefined) {
                delete queryParams[key];
            }
        });
        // console.log('Sorting Request', queryParams)
        router.get(productsIndex().url, queryParams, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
            onFinish: () => {
                requestInProgress.current = false;
            },
        });
    }, [sortConfig, localSearch, requestInProgress, localMinPrice, localMaxPrice]);

    useEffect(() => {
        const productsChanged =
            previousProducts.current.data.length !== products.data.length ||
            previousProducts.current.current_page !== products.current_page;

        const filtersChanged = previousFilters.current.search !== filters.search;

        if (productsChanged || filtersChanged) {
            // console.log('📦 Products updated:', {
            //     items: products.data.length,
            //     page: products.current_page,
            //     search: filters.search,
            //     sort: filters.sort,
            //     direction: filters.direction,
            //     min_price: filters.min_price,
            //     max_price: filters.max_price,
            // });

            previousProducts.current = products;
            previousFilters.current = filters;
        }
    }, [products, filters]);

    const handleResetFilters = useCallback(() => {
        setLocalSearch('');
        setLocalMinPrice('');
        setLocalMaxPrice('');
        executeSearchFilter('');
        executePriceFilter('', '');

        router.get(productsIndex().url, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products Management" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-lg-xl p-4">
                {/* ADD FORM PREVENTION WRAPPER */}
                <div
                    onSubmit={(e) => e.preventDefault()}
                    className='mb-4 flex w-full items-center justify-between gap-4'
                >
                    <Input
                        onChange={handleSearchChange}
                        onKeyDown={handleKeyDown}
                        value={localSearch}
                        type='text'
                        placeholder='Search Product ...'
                        name='search'
                        className='w-1/2'
                    />
                    <PriceFilter
                        min_price={localMinPrice}
                        max_price={localMaxPrice}
                        onPriceChange={handlePriceChange}
                    />
                    <Button
                        className='cursor-pointer bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center'
                        onClick={handleResetFilters}
                    >
                        <X size={20} className='mr-2' /> Reset Filters
                    </Button>
                    <div className='ml-auto'>
                        <Link
                            as="button"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                            href={productsCreate().url}
                        >
                            Add Product
                        </Link>
                    </div>
                </div>

                <table className='w-full table-auto'>
                    <thead>
                        <tr className='bg-gray-700 text-white'>
                            <th className='p-4 border'>#</th>
                            <SortableHeader field="name" currentSort={sortConfig} onSort={handleSort} className='p-4 border'>Name</SortableHeader>
                            <SortableHeader field="description" currentSort={sortConfig} onSort={handleSort} className='p-4 border'>Description</SortableHeader>
                            <SortableHeader field="price" currentSort={sortConfig} onSort={handleSort} className='p-4 border'>Price</SortableHeader>
                            <th className='p-4 border'>Image</th>
                            <SortableHeader field="created_at" currentSort={sortConfig} onSort={handleSort} className='p-4 border'>Created Date</SortableHeader>
                            <th className='p-4 border'>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {products.data?.map((product: any, index: number) => (
                            <tr key={index}>
                                <td className='border px-4 py-2 text-center'>{index + 1}</td>
                                <td className='border px-4 py-2 text-center'>{product.name}</td>
                                <td className='border px-4 py-2 text-center'>{product.description}</td>
                                <td className='border px-4 py-2 text-center'>{product.price}</td>
                                <td className='border px-4 py-2 text-center'>
                                    <img src={product.image} alt={product.name} className='w-20 h-20 object-cover' />
                                </td>
                                <td className='border px-4 py-2 text-center'>{product.created_at}</td>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <MoreHorizontal size={20} className='mx-9 my-9 cursor-pointer' />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuItem asChild>
                                            <Link
                                                as="button"
                                                className="cursor-pointer p-2"
                                                href={productsShow(product.id).url}
                                            >
                                                <Eye size={20} className='mr-2' />
                                                View Details
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link
                                                as="button"
                                                className="cursor-pointer p-2"
                                                href={productsEdit(product.id).url}
                                            >
                                                <Pencil size={20} className='mr-2' />
                                                Edit Product
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Button
                                                className="bg-transparent hover:bg-red-500! hover:text-white! text-red-500 cursor-pointer p-2"
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to delete this product?')) {
                                                        router.delete(productsDestroy(product.id).url, {
                                                            preserveScroll: true,
                                                        });
                                                    }
                                                }}
                                            >
                                                <Trash size={20} className='mr-2' />
                                                Delete Product
                                            </Button>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Pagination products={products} />
            </div>
        </AppLayout>
    );
}
