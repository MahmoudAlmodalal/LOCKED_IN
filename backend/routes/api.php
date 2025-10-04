<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::post('/register', [\App\Http\Controllers\Auth\AuthController::class, 'register']);


Route::get('/ping', fn() => response()->json(['ok' => true]));
