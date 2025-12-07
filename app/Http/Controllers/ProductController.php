<?php

namespace App\Http\Controllers;

use App\Exports\ProductsExport;
use App\Http\Requests\ProductFormRequest;
use App\Imports\ProductsImport;
use App\Models\Product;
use App\Models\Tag;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Log::debug('Request received:', [
        //     'all_params' => $request->all(),
        //     'per_page_raw' => $request->per_page,
        //     'per_page_type' => gettype($request->per_page)
        // ]);
        
        $availablePerPage = [2, 5, 10, 25, 50, 100];

        $perPage = $request->filled('per_page')
            ? (int) $request->input('per_page')
            : 2;

        if (!in_array($perPage, $availablePerPage)) {
            $perPage = 2;
        }

        // Log::debug('Using per page:', [$perPage]);
        
        $products = Product::with('tags');

        if ($request->filled('search')) {
            $search = $request->search;

            $products->where(
                fn($query) =>
                $query->where('name', 'like',  "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('price', 'like', "%{$search}%")
            );
        }

        if ($request->filled('sort')) {
            $sort = $request->sort;
            $direction = $request->direction ?? 'desc';

            $products->orderBy($sort, $direction);
        }

        if ($request->filled('min_price')) {
            $products->where('price', '>=', $request->min_price);
        }

        if ($request->filled('max_price')) {
            $products->where('price', '<=', $request->max_price);
        }

        // Log::debug('Parsed per_page:', ['value' => $perPage, 'type' => gettype($perPage)]);

        $products = $products->latest()->paginate($perPage)->withQueryString();        

        $products->getCollection()->transform(fn($product) => [
            'id' => $product->id,
            'name' => $product->name,
            'description' => $product->description,
            'price' => $product->price,
            'created_at' => $product->created_at->format('d M Y'),
            'image' => $product->image = $product->image
                ? asset('storage/' . $product->image)
                : null,
            'tag' => implode(', ', $product->tags->pluck('tag')->toArray()),
        ]);

        // Log::debug('Rendering index with data:', [
        //     $availablePerPage
        // ]);
        return Inertia::render('products/index', [
            'products' => $products,
            'filters' => $request->only(['search', 'sort', 'direction', 'min_price', 'max_price', 'per_page']),
            'perPageOptions' => $availablePerPage,
            'currentPerPage' => $perPage,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // dd("create");
        $allTags = Tag::all()->pluck('tag')->toArray();
        
        return Inertia::render('products/product-form', [
            'allTags' => $allTags,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     * @param ProductFormRequest $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(ProductFormRequest $request)
    {
        // dd($request->all());
        try {
            $image = null;
            $imageOriginalName = null;

            if ($request->file('image')) {
                $image = $request->file('image');
                $imageOriginalName = $image->getClientOriginalName();
                $image = $image->store('products', 'public');
            }

            $product = Product::create([
                'name' => $request->name,
                'description' => $request->description,
                'image' => $image,
                'image_original_name' => $imageOriginalName,
                'price' => $request->price,
            ]);

            if ($request->has('tag')) {
                $this->syncTags($product, $request->tag);
            }

            if ($product) {
                return redirect()->route('products.index')->with('success', 'Product created successfully.');
            }

            return redirect()->back()->with('error', 'Failed to create product. Please try again.');
        } catch (Exception $e) {
            Log::error('Error creating product: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        $product->load('tags');

        $formattedProduct = [
            'id' => $product->id,
            'name' => $product->name,
            'description' => $product->description,
            'price' => $product->price,
            'created_at' => $product->created_at->format('d M Y'),
            'image' => $product->image
                ? asset('storage/' . $product->image)
                : null,
            'tag' => $product->tags->pluck('tag')->toArray(),
        ];

        return Inertia::render('products/product-form', [
            'product' => $formattedProduct,
            'isView' => true,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        $product->load('tags');

        $allTags = Tag::all()->pluck('tag')->toArray();

        $formattedProduct = [
            'id' => $product->id,
            'name' => $product->name,
            'description' => $product->description,
            'price' => $product->price,
            'created_at' => $product->created_at->format('d M Y'),
            'image' => $product->image
                ? asset('storage/' . $product->image)
                : null,
            'tag' => $product->tags->pluck('tag')->toArray(),
        ];

        return Inertia::render('products/product-form', [
            'product' => $formattedProduct,
            'isEdit' => true,
            'allTags' => $allTags,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ProductFormRequest $request, Product $product)
    {
        // Log::debug('Processing update with data:', $request->all());
        if ($product) {
            $product->name = $request->name;
            $product->description = $request->description;
            $product->price = $request->price;

            if ($request->file('image')) {

                if ($product->image) {
                    Storage::disk('public')->delete($product->image);
                }

                $image = $request->file('image');
                $imageOriginalName = $image->getClientOriginalName();
                $imagePath = $image->store('products', 'public');
                $product->image = $imagePath;
            }

            $product->save();

            if ($request->has('tag')) {
                $this->syncTags($product, $request->tag);
            }
            
            return redirect()->route('products.index')->with('success', 'Product updated successfully.');
        }

        return redirect()->back()->with('error', 'Failed to update product. Please try again.');
    }

    private function syncTags(Product $product, $tagsInput)
    {
        // Log::debug("syncTags called with input:", ['input' => $tagsInput]);
        if (is_array($tagsInput)) {
            $tagNames = $tagsInput;
        }        
        else {
            $tagNames = array_filter(array_map('trim', explode(',', $tagsInput)));
        }

        $tagIds = [];
        foreach ($tagNames as $tagName) {
            $tagName = trim($tagName);
            if (!empty($tagName)) {
                $tag = Tag::firstOrCreate(['tag' => $tagName]);
                $tagIds[] = $tag->id;
            }
        }

        $product->tags()->sync($tagIds);
    // ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        // dd("destroy");
        if ($product) {
            $product->delete();

            return redirect()->route('products.index')->with('success', 'Product deleted successfully.');
        }

        return redirect()->back()->with('error', 'Failed to delete product. Please try again.');
    }

    /**
     * Export products
     */
    public function export(Request $request)
    {
        $filters = $request->only(['search', 'min_price', 'max_price', 'sort', 'direction']);
        
        $fileName = 'products_' . date('Y-m-d_H-i-s') . '.xlsx';
        
        return Excel::download(new ProductsExport($filters), $fileName);
    }
    
    /**
     * Import products
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:5120',
        ]);

        try {
            $import = new ProductsImport();
            Excel::import($import, $request->file('file'));

            return response()->json([
                'success' => true,
                'message' => "Products imported successfully.",
            ]);
        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            $failures = $e->failures();

            $errors = [];
            foreach ($failures as $failure) {
                $errors[] = [
                    'row' => $failure->row(),
                    'attribute' => $failure->attribute(),
                    'errors' => $failure->errors(),
                    'values' => $failure->values(),
                ];
            }

            return response()->json([
                'success' => false,
                'message' => 'Import failed due to validation errors',
                'errors' => $errors,
            ], 422);
        } catch (\Exception $e) {
            Log::error('Import error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Import failed: ' . $e->getMessage(),
            ], 500);
        }
    }

}
