<?php

use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    
    Route::get('products/export', [ProductController::class, 'export'])->name('products.export.download');

    Route::post('products/import', [ProductController::class, 'import'])->name('products.import');
    
    Route::resource('products', ProductController::class);
});

require __DIR__.'/settings.php';
