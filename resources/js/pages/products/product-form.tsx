import { create as productsCreate, store as productsStore, update as productsUpdate } from '@/actions/App/Http/Controllers/ProductController';
import InputError from '@/components/input-error';
import { TagManager } from '@/components/tags/TagManager';
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

export default function ProductForm({ ...props }) {

    const { product, isView, isEdit, allTags = [] } = props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: `${isView ? 'Show' : isEdit ? 'Update' : 'Create'} Product`,
            href: productsCreate().url,
        },
    ];

    // console.log('📦 Product:', product);
    const { data, setData, post, errors, processing, reset, transform } = useForm({
        name: product?.name || '',
        description: product?.description || '',
        image: null as File | null,
        price: product?.price || '',
        _method: isEdit ? 'PUT' : 'POST',
        tag: product?.tag
        ? Array.isArray(product.tag) 
            ? product.tag 
            : product.tag.split(',').map((t: string) => t.trim()).filter((t: string) => t !== '')
        : [],
        tagInput: '',
        availableTags: allTags,
    });

    const removeTag = (tagToRemove: any) => {
        setData({
            ...data,
            tag: data.tag.filter((tag: string) => tag !== tagToRemove),
        });
    };

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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
        }

        if (e.key === 'Enter' && data.tagInput) {
            const newTag = data.tagInput.trim();

            if (newTag && !data.tag.includes(newTag)) {
                setData({
                    ...data,
                    tag: [...data.tag, newTag],
                    tagInput: ""
                });
            }
        }
    };   

    // console.log('Type of tag:', typeof data.tag);
    // console.log('Value of tag:', data.tag);
    
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
                                <TagManager
                                    initialTags={data.tag || []}
                                    availableTags={allTags || []}
                                    onTagsChange={(newTags) => setData('tag', newTags)}
                                    isViewMode={isView}
                                    isSubmitting={processing}
                                    maxTags={20}
                                />

                                {/* <Label htmlFor="tag" className="block text-sm font-medium text-gray-700">
                                    Tags {data.tag.length > 0 && `(${data.tag.length})`}
                                </Label> */}

                                {/* Tag Input Field */}
                                {/* {!isView && (
                                    <div className="flex gap-2 mt-2">
                                        <Input
                                            value={data.tagInput || ""}
                                            onChange={(e) => setData('tagInput', e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            type="text"
                                            name="tag"
                                            id="tag"
                                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            disabled={processing}
                                            placeholder="Type a tag and press Enter or click Add"
                                        />
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                if (data.tagInput && data.tagInput.trim()) {
                                                    const newTag = data.tagInput.trim();
                                                    if (newTag && !data.tag.includes(newTag)) {
                                                        setData('tag', [...data.tag, newTag]);
                                                        setData('tagInput', "");
                                                    }
                                                }
                                            }}
                                            className="rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500"
                                            disabled={processing}
                                        >
                                            Add Tag
                                        </Button>
                                    </div>
                                )} */}

                                {/* Display Current Product Tags */}
                                {/* <div className="mt-4">
                                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                                        Current Tags
                                    </Label>
                                    {Array.isArray(data?.tag) && data?.tag?.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {data.tag.map((tag: string, index: number) => (
                                                <Badge
                                                    key={index}
                                                    className="bg-blue-500 text-white flex items-center gap-1"
                                                >
                                                    {tag}
                                                    {!isView && (
                                                        <button
                                                            onClick={() => removeTag(tag)}
                                                            className="bg-transparent hover:bg-red-500 hover:text-white text-red-500 cursor-pointer p-1 rounded"
                                                            type="button"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    )}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-gray-500 text-sm p-2 border border-dashed border-gray-300 rounded-md text-center">
                                            No tags added yet. {!isView && "Type above and press Enter to add tags."}
                                        </div>
                                    )}
                                </div> */}

                                {/* Display All Available Tags from Database */}
                                {/* {!isView && allTags && allTags.length > 0 && (
                                    <div className="mt-4">
                                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                                            Available Tags ({allTags.length})
                                        </Label>
                                        <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-md bg-gray-50">
                                            {allTags.map((existingTag: string, index: number) => (
                                                <Badge
                                                    key={index}
                                                    className={`cursor-pointer transition-colors ${data.tag.includes(existingTag)
                                                            ? 'bg-green-500 text-white'
                                                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                                        }`}
                                                    onClick={() => {
                                                        if (!data.tag.includes(existingTag)) {
                                                            setData('tag', [...data.tag, existingTag]);
                                                        }
                                                    }}
                                                >
                                                    {existingTag}
                                                    {data.tag.includes(existingTag) && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeTag(existingTag);
                                                            }}
                                                            className="ml-1 bg-transparent hover:bg-red-500 hover:text-white text-red-500 cursor-pointer p-1 rounded"
                                                            type="button"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    )}
                                                </Badge>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Click on any tag to add it to this product
                                        </p>
                                    </div>
                                )} */}

                                {/* <InputError message={errors.tag} /> */}
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
                                    <img src={product.image} alt={product.name} className='w-20 h-20 object-cover' />
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
