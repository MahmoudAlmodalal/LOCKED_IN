<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterUserRequest; // Import the request
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash; // Import the Hash facade

class AuthController extends Controller
{
    /**
     * Handle a user registration request.
     */
    public function register(RegisterUserRequest $request)
    {
        // The request is already validated at this point.

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password), // Hash the password
            // The 'role' will automatically default to 'End User' as defined in the migration.
        ]);

        // You can also create a token here for immediate login after registration.
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'User successfully registered',
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201); // 201 Created status
    }
}
