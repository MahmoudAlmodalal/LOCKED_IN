<?php
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CalendarEventController;
use App\Http\Controllers\PomodoroSessionController;
use App\Http\Controllers\NotificationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// === PUBLIC ROUTES ===
// These routes are accessible to anyone, without authentication.

// User Registration
Route::post('/register', [AuthController::class, 'register']);

// User Login
Route::post('/login', [AuthController::class, 'login']);

// Password Reset Flow
Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword']);
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);


// === PROTECTED ROUTES ===
// These routes require a valid Sanctum API token to be accessed.
Route::middleware('auth:sanctum')->group(function () {

    // User Logout
    Route::post('/logout', [AuthController::class, 'logout']);

    // Get Authenticated User Details
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::apiResource('tasks', TaskController::class);
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('habits', \App\Http\Controllers\HabitController::class);
    Route::apiResource('calendar-events', CalendarEventController::class);
    Route::apiResource('pomodoro-sessions', PomodoroSessionController::class);
    Route::apiResource('notifications', NotificationController::class)->except(['store', 'show']);
    Route::apiResource('habit-entries', \App\Http\Controllers\HabitEntryController::class);

    // Add other future protected routes here...
    // e.g., Route::apiResource('/tasks', TaskController::class);
});
