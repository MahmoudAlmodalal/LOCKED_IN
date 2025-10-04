<?php

namespace App\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * Define the routes for the application.
     */


public function boot(): void
{
    $this->routes(function () {
        Route::middleware('api')
            ->prefix('api') // <-- THIS IS THE CRITICAL PART
            ->group(base_path('routes/api.php')); // <-- AND THIS

        Route::middleware('web')
            ->group(base_path('routes/web.php'));
    });
}
}