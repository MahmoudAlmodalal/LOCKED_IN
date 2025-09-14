
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
