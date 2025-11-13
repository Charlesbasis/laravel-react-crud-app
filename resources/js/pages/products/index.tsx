import {
    create as productsCreate,
    index as productsIndex,
    show as productsShow,
    edit as productsEdit,
    destroy as productsDestroy
} from '@/actions/App/Http/Controllers/ProductController';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Product, type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Pencil, Trash } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manage Products',
        href: productsIndex().url,
    },
];

export default function Index({ ...props }: { products: Product[] }) {
    
    const { products } = props;

    console.log('check products', products);
    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products Management" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-lg-xl p-4">
                
                <div className='ml-auto'>
                    <Link
                        as="button"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                        href={productsCreate().url}
                    >
                        Add Product
                    </Link>
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
                        {products?.map((product, index) => (
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
            </div>
        </AppLayout>
    );
}
