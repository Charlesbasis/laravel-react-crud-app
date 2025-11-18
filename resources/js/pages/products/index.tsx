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
import { IndexProps, type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Eye, Pencil, Trash, X } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manage Products',
        href: productsIndex().url,
    },
];

export default function Index({ products, filters }: IndexProps) {

    console.log('check products', filters);

    const { data, setData } = useForm({
        search: filters.search || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setData('search', value);

        const queryString = value ? { search: value } : {};

        router.get(productsIndex().url, queryString, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleReset = () => {
        setData('search', '');
        router.get(productsIndex().url, {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products Management" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-lg-xl p-4">
                <div className='mb-4 flex w-full items-center justify-between gap-4'>
                    <Input
                        onChange={handleChange}
                        value={data.search}
                        type='text'
                        placeholder='Search Product ...'
                        name='search'
                        className='w-1/2'
                    />
                    <Button 
                        className='cursor pointer bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg' 
                        onClick={handleReset}
                    >
                        <X size={20} />
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
                            <th className='p-4 border'>Name</th>
                            <th className='p-4 border'>Description</th>
                            <th className='p-4 border'>Price</th>
                            <th className='p-4 border'>Image</th>
                            <th className='p-4 border'>Created Date</th>
                            <th className='p-4 border'>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {products.data?.map((product, index) => (
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
                                                router.delete(productsDestroy(product.id).url), {
                                                    preserveScroll: true,
                                                };
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
