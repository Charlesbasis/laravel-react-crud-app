<?php

namespace App\Http\Controllers;

use App\Exports\ProductsExport;
use App\Http\Requests\ProductFormRequest;
use App\Imports\ProductsImport;
use App\Models\Product;
use App\Models\Tag;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ProductController extends Controller
{
    // Cache duration in seconds
    private const CACHE_TTL = 300;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Get cache key based on request parameters
        $cacheKey = $this->getCacheKey($request);

        // Check if this is a search engine bot
        $isBot = $this->isSearchEngineBot($request);

        // For bots, don't use cache or use very short cache
        if ($isBot) {
            $products = $this->getPaginatedProducts($request);
        } else {
            // For regular users, use caching
            $products = Cache::remember(
                $cacheKey,
                self::CACHE_TTL,
                fn() => $this->getPaginatedProducts($request)
            );
        }

        // Set proper cache-control headers
        $this->setCacheHeaders($isBot);

        // Transform the collection after pagination
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

        return Inertia::render('products/index', [
            'products' => $products,
            'filters' => $request->only(['search', 'sort', 'direction', 'min_price', 'max_price', 'per_page']),
            'perPageOptions' => [2, 5, 10, 25, 50, 100],
            'currentPerPage' => $this->getValidPerPage($request),
        ]);
    }

    /**
     * Get paginated products based on request
     */
    private function getPaginatedProducts(Request $request)
    {
        $perPage = $this->getValidPerPage($request);

        $productsQuery = Product::with('tags');

        // Apply filters
        $this->applyFilters($productsQuery, $request);

        return $productsQuery->paginate($perPage)->withQueryString();
    }

    /**
     * Apply filters to query
     */
    private function applyFilters($query, Request $request)
    {
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(
                fn($q) =>
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('price', 'like', "%{$search}%")
            );
        }

        if ($request->filled('sort')) {
            $direction = $request->direction ?? 'desc';
            $query->orderBy($request->sort, $direction);
        } else {
            $query->latest();
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }
    }

    /**
     * Get valid per page value
     */
    private function getValidPerPage(Request $request): int
    {
        $availablePerPage = [2, 5, 10, 25, 50, 100];
        $perPage = $request->filled('per_page') ? (int) $request->input('per_page') : 2;

        return in_array($perPage, $availablePerPage) ? $perPage : 2;
    }

    /**
     * Generate cache key based on request
     */
    private function getCacheKey(Request $request): string
    {
        // Exclude page parameter from cache key to cache all pages
        $cacheParams = $request->except('page');
        ksort($cacheParams); // Sort for consistent keys

        return 'products:' . md5(json_encode($cacheParams));
    }

    /**
     * Check if request is from a search engine bot
     */
    private function isSearchEngineBot(Request $request): bool
    {
        $userAgent = $request->header('User-Agent');

        if (!$userAgent) {
            return false;
        }

        $bots = [
            'googlebot',
            'bingbot',
            'slurp',
            'duckduckbot',
            'baiduspider',
            'yandexbot',
            'sogou',
            'exabot',
            'facebot',
            'ia_archiver',
            'facebookexternalhit',
            'twitterbot',
            'rogerbot',
            'linkedinbot',
            'embedly',
            'quora link preview',
            'showyoubot',
            'outbrain',
            'pinterest/0.',
            'developers.google.com/+/web/snippet',
            'whatsapp',
            'slackbot',
            'discordbot'
        ];

        foreach ($bots as $bot) {
            if (stripos($userAgent, $bot) !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Set proper cache headers
     */
    private function setCacheHeaders(bool $isBot): void
    {
        if (!headers_sent()) {
            if ($isBot) {
                // Tell bots they can cache but not for long
                header('Cache-Control: public, max-age=60, s-maxage=60');
                header('Vary: User-Agent');
            } else {
                // Longer cache for regular users
                header('Cache-Control: public, max-age=300, s-maxage=300');
                header('Vary: User-Agent, X-Requested-With');
            }
        }
    }

    /**
     * Clear cache when products change
     */
    private function clearProductsCache(): void
    {
        // Pattern-based clearing for Redis/Memcached
        if (config('cache.default') === 'redis' || config('cache.default') === 'memcached') {
            // Using cache tags if supported
            Cache::tags(['products'])->flush();
        } else {
            // For file/database cache, clear all product-related cache
            // Note: This is less efficient but works for all drivers
            Cache::flush(); // Be careful - this clears ALL cache

            // OR implement a more targeted approach
            // $this->clearSpecificProductCache();
        }
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
            'slug' => $product->slug,
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
        } else {
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

    /**
     * Display dashboard statistics
     */
    public function dashboardStats(Request $request)
    {
        // Cache dashboard stats for better performance
        $cacheKey = 'dashboard_stats_' . ($request->user()->id ?? 'guest');
        $stats = Cache::remember($cacheKey, 60, function () {
            return $this->calculateDashboardStats();
        });

        return response()->json($stats);
    }

    /**
     * Calculate comprehensive dashboard statistics
     */
    private function calculateDashboardStats(): array
    {
        // Use database aggregation for better performance
        $basicStats = Product::select([
            DB::raw('COUNT(*) as total_products'),
            DB::raw('SUM(price) as total_value'),
            DB::raw('AVG(price) as avg_price'),
            DB::raw('MIN(price) as min_price'),
            DB::raw('MAX(price) as max_price'),
        ])
            ->first()
            ->toArray();

        // Get recent products (last 7 days)
        $recentProducts = Product::where('created_at', '>=', now()->subDays(7))
            ->count();

        // Get growth statistics (last 30 days vs previous 30 days)
        $currentPeriodStart = now()->subDays(30);
        $previousPeriodStart = now()->subDays(60);
        $previousPeriodEnd = now()->subDays(30);

        $currentPeriodStats = Product::where('created_at', '>=', $currentPeriodStart)
            ->select([
                DB::raw('COUNT(*) as product_count'),
                DB::raw('SUM(price) as total_value'),
            ])
            ->first();

        $previousPeriodStats = Product::whereBetween('created_at', [$previousPeriodStart, $previousPeriodEnd])
            ->select([
                DB::raw('COUNT(*) as product_count'),
                DB::raw('SUM(price) as total_value'),
            ])
            ->first();

        // Calculate growth percentages
        $productGrowth = $this->calculateGrowthPercentage(
            $previousPeriodStats->product_count ?? 0,
            $currentPeriodStats->product_count ?? 0
        );

        $valueGrowth = $this->calculateGrowthPercentage(
            $previousPeriodStats->total_value ?? 0,
            $currentPeriodStats->total_value ?? 0
        );

        // Get category distribution - FIXED: Removed incorrect whereHas call
        $categoryDistribution = Tag::withCount(['products'])
            ->orderByDesc('products_count')
            ->limit(10)
            ->get()
            ->map(fn($tag) => [
                'name' => $tag->tag,
                'count' => $tag->products_count,
                'percentage' => $tag->products_count > 0 && $basicStats['total_products'] > 0
                    ? round(($tag->products_count / $basicStats['total_products']) * 100, 1)
                    : 0,
            ]);

        // Get price distribution (buckets)
        $priceDistribution = $this->getPriceDistribution();

        // Get recent products (last 5 products)
        $recentProductsList = Product::with('tags')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($product) {
                $status = $product->image ? 'active' : 'draft';
                return [
                    'id' => (int) $product->id,
                    'name' => (string) $product->name,
                    'price' => (float) $product->price, // Cast to float
                    'created_at' => $product->created_at->diffForHumans(),
                    'tag' => $product->tags->first()->tag ?? 'Uncategorized',
                    'status' => $status,
                    'image' => $product->image ? asset('storage/' . $product->image) : null,
                ];
            });

        // Get products without images (drafts)
        $draftProducts = Product::whereNull('image')
            ->orWhere('image', '')
            ->count();

        // Get products added today
        $todayProducts = Product::whereDate('created_at', today())
            ->count();

        // Calculate percentage of active products
        $activePercentage = $basicStats['total_products'] > 0
            ? round((($basicStats['total_products'] - $draftProducts) / $basicStats['total_products']) * 100, 1)
            : 0;

        return [
            'basic_stats' => [
                'total_products' => (int) ($basicStats['total_products'] ?? 0),
                'total_value' => (float) ($basicStats['total_value'] ?? 0),
                'avg_price' => (float) ($basicStats['avg_price'] ?? 0),
                'min_price' => (float) ($basicStats['min_price'] ?? 0),
                'max_price' => (float) ($basicStats['max_price'] ?? 0),
            ],
            'growth_stats' => [
                'products' => $productGrowth,
                'value' => $valueGrowth,
                'recent_products' => $recentProducts,
                'today_products' => $todayProducts,
            ],
            'category_distribution' => $categoryDistribution,
            'price_distribution' => $priceDistribution,
            'recent_products' => $recentProductsList,
            'status_summary' => [
                'active' => $basicStats['total_products'] - $draftProducts,
                'draft' => $draftProducts,
                'total' => $basicStats['total_products'],
                'active_percentage' => $activePercentage,
            ],
            'timestamps' => [
                'calculated_at' => now()->toISOString(),
                'cache_expires' => now()->addSeconds(60)->toISOString(),
                'data_current_as_of' => now()->format('Y-m-d H:i:s'),
            ],
        ];
    }

    /**
     * Calculate growth percentage
     */
    private function calculateGrowthPercentage(float $previous, float $current): float
    {
        if ($previous == 0) {
            return $current > 0 ? 100.0 : 0.0;
        }

        $growth = (($current - $previous) / $previous) * 100;
        return round($growth, 2);
    }

    /**
     * Get price distribution in buckets
     */
    private function getPriceDistribution(): array
    {
        $buckets = [
            ['label' => 'Under $10', 'min' => 0, 'max' => 10],
            ['label' => '$10 - $50', 'min' => 10, 'max' => 50],
            ['label' => '$50 - $100', 'min' => 50, 'max' => 100],
            ['label' => '$100 - $500', 'min' => 100, 'max' => 500],
            ['label' => '$500 - $1000', 'min' => 500, 'max' => 1000],
            ['label' => 'Over $1000', 'min' => 1000, 'max' => null],
        ];

        $distribution = [];
        $totalProducts = Product::count();

        foreach ($buckets as $bucket) {
            $query = Product::query();

            if ($bucket['min'] !== null) {
                $query->where('price', '>=', $bucket['min']);
            }

            if ($bucket['max'] !== null) {
                $query->where('price', '<', $bucket['max']);
            } else {
                $query->where('price', '>=', $bucket['min']);
            }

            $count = $query->count();
            $percentage = $totalProducts > 0 ? round(($count / $totalProducts) * 100, 1) : 0;

            $distribution[] = [
                'label' => $bucket['label'],
                'count' => $count,
                'percentage' => $percentage,
                'min' => $bucket['min'],
                'max' => $bucket['max'],
            ];
        }

        return $distribution;
    }

    /**
     * Get activity log for dashboard
     */
    public function getActivityLog(Request $request)
    {
        $limit = $request->get('limit', 10);

        // Get recent product activities
        $activities = Product::with('tags')
            ->latest()
            ->limit($limit)
            ->get()
            ->map(function ($product) {
                $hoursAgo = $product->created_at->diffInHours(now());
                $action = $hoursAgo < 24 ? 'CREATE' : 'UPDATE';

                return [
                    'id' => $product->id,
                    'action' => $action,
                    'description' => "Product: {$product->name}",
                    'timestamp' => $product->created_at->diffForHumans(),
                    'user' => 'System',
                    'price' => $product->price,
                    'category' => $product->tags->first()->tag ?? 'Uncategorized',
                    'product_id' => $product->id,
                    'created_at' => $product->created_at->toISOString(),
                ];
            });

        return response()->json([
            'activities' => $activities,
            'total' => $activities->count(),
            'limit' => $limit,
            'fetched_at' => now()->toISOString(),
        ]);
    }

}
