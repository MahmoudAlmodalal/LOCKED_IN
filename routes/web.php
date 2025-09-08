<?php
use App\Http\Controllers\Auth\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\PasswordResetController;

Route::get('/', function () {
    // Public routes
    return view('welcome');
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword']);
    Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);

    // Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Route for user logout
    Route::post('/logout', [AuthController::class, 'logout']);

    // You can add other protected routes here in the future
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

});
});
