<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Support\Facades\Auth;
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
    /**
     * Handle a user login request.
     */
    public function login(Request $request)
    {
        // 1. Validate the incoming request data
        $credentials = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        // 2. Attempt to authenticate the user with the provided credentials
        if (!Auth::attempt($credentials)) {
            // If authentication fails, return an error response
            return response()->json([
                'message' => 'Invalid login credentials'
            ], 401); // 401 Unauthorized
        }

        // 3. If authentication is successful, get the authenticated user
        $user = $request->user();

        // 4. Revoke any old tokens and create a new API token for the user
        $user->tokens()->delete(); // Optional: Invalidates all old tokens
        $token = $user->createToken('auth_token')->plainTextToken;

        // 5. Return the token in the JSON response
        return response()->json([
            'message' => 'Login successful',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user // Optional: return user details
        ]);
    }
        /**
     * Handle a user logout request.
     */
    public function logout(Request $request)
    {
        // Get the authenticated user and revoke their current token.
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'User successfully logged out'
        ]);
    }
}
