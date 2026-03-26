<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('sitemap:generate', function () {
    $this->call(\App\Console\Commands\GenerateSitemap::class);
})->purpose('Generate the sitemap.xml file');

// Schedule it to run daily
\Illuminate\Support\Facades\Schedule::command('sitemap:generate')->daily();
