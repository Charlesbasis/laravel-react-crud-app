import { create as productsCreate, store as productsStore, update as productsUpdate } from '@/actions/App/Http/Controllers/ProductController';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Textarea } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

export default function ProductForm({ ...props }) {

    const { product, isView, isEdit } = props;

    const [tagInput, setTagInput] = useState('');
    const tagInputTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: `${isView ? 'Show' : isEdit ? 'Update' : 'Create'} Product`,
            href: productsCreate().url,
        },
    ];

    const { data, setData, post, errors, processing, reset, transform } = useForm({
        name: product?.name || '',
        description: product?.description || '',
        image: null as File | null,
        price: product?.price || '',
        _method: isEdit ? 'PUT' : 'POST',
        tags: product?.tags ? product.tags.map((tag: any) => tag.name) : [],
    });

    const removeTag = useCallback((tag: string) => {
        setData('tags', data.tags.filter((t: string) => t !== tag));
    }, [data.tags, setData]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // console.log('📦 Submitting form with data:', data);

        const url = isEdit ? productsUpdate(product.id).url : productsStore().url;

        transform((data) => {
            if (isEdit && data.image === null) {
                const { image, ...rest } = data;
                return rest;
            }
            // console.log('📦 Transformed data:', data);
            return data;
        });

        post(url, {
            forceFormData: true,
            onSuccess: () => reset(),
            onError: (error) => console.error('📦 Error submitting form:', error),
        });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setData('image', e.target.files[0]);
        }
    };

    console.log('Type of tags:', typeof data.tags);
    console.log('Value of tags:', data.tags);
    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Product Form" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">

                <Card>
                    <CardHeader>
                        <CardTitle>{isView ? 'Show' : isEdit ? 'Update' : 'Create'} Product</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4" autoComplete="off">
                            <div className="col-span-6 sm:col-span-4">
                                <Label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Name
                                </Label>
                                <Input
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    type="text"
                                    name="name"
                                    id="name"
                                    disabled={isView || processing}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />

                                <InputError message={errors.name} />
                            </div>
                            <div className="col-span-6 sm:col-span-4">
                                <Label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                    Description
                                </Label>
                                <Textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={3}
                                    cols={80}
                                    name="description"
                                    id="description"
                                    disabled={isView || processing}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                                <InputError message={errors.description} />
                            </div>
                            <div className="col-span-6 sm:col-span-4">
                                <Label htmlFor="price" className="block text-sm font-medium text-gray-700">
                                    Price
                                </Label>
                                <Input
                                    value={data.price}
                                    onChange={(e) => setData('price', e.target.value)}
                                    type="text"
                                    name="price"
                                    id="price"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    disabled={isView || processing}
                                />
                                <InputError message={errors.price} />
                            </div>
                            <div className="col-span-6 sm:col-span-4">
                                <Label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                                    Tags
                                </Label>
                                {!isView && (
                                    <Input
                                        value={data?.tags}
                                        onChange={(e) => setData('tags', e.target.value)}
                                        type="text"
                                        name="tags"
                                        id="tags"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        disabled={isView || processing}
                                    />
                                )}
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {data?.tags?.length > 0 ? (
                                        data?.tags?.map((tag: string, index: number) => (
                                            <Badge
                                                key={index}
                                                className="bg-blue-500 text-white"
                                            >
                                                {tag}
                                                {!isView && (
                                                    <Button
                                                        onClick={() => removeTag(tag)}
                                                        className="bg-transparent hover:bg-red-500! hover:text-white! text-red-500 cursor-pointer p-2"
                                                    >
                                                        <X size={20} className='mr-2' />
                                                        Remove
                                                    </Button>
                                                )}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-gray-500">No tags added yet.</span>
                                    )
                                    }
                                </div>
                                <InputError message={errors.tags} />
                            </div>

                            {!isView && (
                                <div className="col-span-6 sm:col-span-4">
                                    <Label htmlFor="Image" className="block text-sm font-medium text-gray-700">
                                        Image
                                    </Label>
                                    <Input
                                        onChange={handleFileUpload}
                                        type="file"
                                        name="image"
                                        id="image"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        autoFocus
                                        tabIndex={4}
                                    />
                                    <InputError message={errors.image} />
                                </div>
                            )}

                            {(isView || isEdit) && (
                                <div className="col-span-6 sm:col-span-4">
                                    <Label htmlFor="Image" className="block text-sm font-medium text-gray-700">
                                        Current Image
                                    </Label>
                                    <img src={`/storage/${product.image}`} alt={product.name} className='w-20 h-20 object-cover' />
                                </div>
                            )}

                            {!isView && (
                                <div className="col-span-6 sm:col-span-4">
                                    <Button
                                        type="submit"
                                        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                    >
                                        {processing && <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />}
                                        {processing ? (isEdit ? 'Updating...' : 'Creating...') : isEdit ? 'Update Product' : 'Create Product'}
                                    </Button>
                                </div>
                            )}
                        </form>
                    </CardContent>
                </Card>

            </div>
        </AppLayout>
    );
}
