import {
    create as productsCreate,
    destroy as productsDestroy,
    edit as productsEdit,
    index as productsIndex,
    show as productsShow
} from '@/actions/App/Http/Controllers/ProductController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, Pencil, Trash, X } from 'lucide-react';
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

    const previousProducts = useRef(products);
    const previousFilters = useRef(filters);

    const executeSearch = useCallback((value: string) => {
        if (requestInProgress.current) return;

        requestInProgress.current = true;
        const queryString = value ? { search: value } : {};

        console.log('🚀 Making Inertia request with:', queryString);

        router.get(productsIndex().url, queryString, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
            onFinish: () => {
                requestInProgress.current = false;
            },
        });
    }, []);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        console.log('⌨️ Input changed:', value);
        setLocalSearch(value);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            executeSearch(value);
        }, 500);
    }, [executeSearch]);

    // ADD THIS: Prevent form submission on Enter key
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            console.log('⏹️ Prevented form submission on Enter');
            
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
            executeSearch(localSearch);
        }
    }, [localSearch, executeSearch]);

    // FIXED RESET FUNCTION
    // const handleReset = useCallback(() => {
    //     console.log('🔄 Resetting search');
    //     setLocalSearch('');
        
    //     // Clear any pending search timeout
    //     if (searchTimeoutRef.current) {
    //         clearTimeout(searchTimeoutRef.current);
    //         searchTimeoutRef.current = null;
    //     }
        
    //     // Only make request if we actually have a search value to clear
    //     if (filters.search) {
    //         router.get(productsIndex().url, {}, {
    //             preserveScroll: true,
    //             preserveState: true,
    //             replace: true, // Add replace to prevent history buildup
    //         });
    //     }
    // }, [filters.search]);

    // Smart logging - only log when data actually changes
    useEffect(() => {
        const productsChanged =
            previousProducts.current.data.length !== products.data.length ||
            previousProducts.current.current_page !== products.current_page;

        const filtersChanged = previousFilters.current.search !== filters.search;

        if (productsChanged || filtersChanged) {
            console.log('📦 Products updated:', {
                items: products.data.length,
                page: products.current_page,
                search: filters.search
            });

            previousProducts.current = products;
            previousFilters.current = filters;
        }
    }, [products, filters]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
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
                        onChange={handleChange}
                        onKeyDown={handleKeyDown} // ADD THIS
                        value={localSearch}
                        type='text'
                        placeholder='Search Product ...'
                        name='search'
                        className='w-1/2'
                    />
                    <Link
                        href={productsIndex().url}
                        preserveScroll
                        preserveState
                        replace
                        as="button"
                        className='cursor-pointer bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center'
                    >
                        <X size={20} />
                    </Link>
                    {/* <Button 
                        className='cursor-pointer bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg' 
                        onClick={handleReset}
                        type="button" // ADD THIS to prevent form submission
                    >
                        <X size={20} />
                    </Button> */}
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
                            <th className='p-4 border'>Name</th>
                            <th className='p-4 border'>Description</th>
                            <th className='p-4 border'>Price</th>
                            <th className='p-4 border'>Image</th>
                            <th className='p-4 border'>Created Date</th>
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
                                <td className='border px-4 py-2 text-center'>
                                    <Link
                                        as="button"
                                        className="cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 rounded-lg"
                                        href={productsShow(product.id).url}
                                    >
                                        <Eye size={20} />
                                    </Link>
                                    <Link
                                        as="button"
                                        className="ms-2 cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 rounded-lg"
                                        href={productsEdit(product.id).url}
                                    >
                                        <Pencil size={20} />
                                    </Link>
                                    <Button
                                        className="ms-2 cursor-pointer bg-red-500 hover:bg-red-700 text-white font-bold p-2 rounded-lg"
                                        onClick={() => {
                                            if (confirm('Are you sure you want to delete this product?')) {
                                                router.delete(productsDestroy(product.id).url, { // FIXED: Added comma
                                                    preserveScroll: true,
                                                });
                                            }
                                        }}
                                    >
                                        <Trash size={20} />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Pagination products={products} />
            </div>
        </AppLayout>
    );
}
