<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductFormRequest;
use App\Models\Product;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // dd("index");
        // $products = Product::all();

        // dump($request->all());

        // Log::debug("🔄 {$request} REQUEST", [
        //     'timestamp' => now()->format('H:i:s:v'),
        //     'search' => $request->search,
        //     'url' => $request->fullUrl(),
        //     'referrer' => $request->header('referer'),
        //     'method' => $request->method(),
        // ]);

        // Add request fingerprint to detect duplicates
        // $requestFingerprint = md5($request->fullUrl() . $request->header('User-Agent') . microtime());
        // Log::debug('🔢 Request Fingerprint', ['fingerprint' => $requestFingerprint]);

        $products = Product::query();

        if ($request->filled('search')) {
            $search = $request->search;

            $products->where(fn($query) => 
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
        
        $products = $products->latest()->paginate(2)->withQueryString();
        
        $products->getCollection()->transform(fn($product) => [
            'id' => $product->id,
            'name' => $product->name,
            'description' => $product->description,
            'price' => $product->price,
            'created_at' => $product->created_at->format('d M Y'),
            'image' => $product->image = $product->image
                ? asset('storage/' . $product->image)
                : null,
        ]);

        // dd($products);
        // Log::debug('Request ID: ' . uniqid(), ['search' => $request->search]);

        return Inertia::render('products/index', [
            'products' => $products,
            'filters' => $request->only(['search', 'sort', 'direction', 'min_price', 'max_price']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // dd("create");
        return Inertia::render('products/product-form');
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
        return Inertia::render('products/product-form', [
            'product' => $product,
            'isView' => true,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        // dd("edit");
        // Log::debug('Processing edit with data:', $product->toArray());
        return Inertia::render('products/product-form', [
            'product' => $product,
            'isEdit' => true,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ProductFormRequest $request, Product $product)
    {
        // dd("update");
        // Log::debug('Processing update with data:', $request->all());
        if ($product){
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

            return redirect()->route('products.index')->with('success', 'Product updated successfully.');
        }
        
        return redirect()->back()->with('error', 'Failed to update product. Please try again.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        // dd("destroy");
        if ($product){
            $product->delete();

            return redirect()->route('products.index')->with('success', 'Product deleted successfully.');
        }
        
        return redirect()->back()->with('error', 'Failed to delete product. Please try again.');
    }
}
