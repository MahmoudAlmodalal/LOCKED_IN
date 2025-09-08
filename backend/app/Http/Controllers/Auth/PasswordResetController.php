<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password; // Import the Password facade
use App\Models\User;

class PasswordResetController extends Controller
{
    /**
     * Handle a "forgot password" request.
     * Sends a password reset link to the user's email.
     */
    public function forgotPassword(Request $request)
    {
        // 1. Validate the email address
        $request->validate(['email' => 'required|email|exists:users,email']);

        // 2. Use the PasswordBroker to send the reset link
        $status = Password::sendResetLink($request->only('email'));

        // 3. Check the status and return a response
        if ($status !== Password::RESET_LINK_SENT) {
            // This can happen due to throttling or other issues
            return response()->json(['message' => __($status)], 400);
        }

        return response()->json([
            'message' => 'Password reset email sent successfully.',
            'status' => __($status)
        ]);
    }
      /**
     * Handle the actual password reset.
     */
    public function resetPassword(Request $request)
    {
        // 1. Validate the incoming data
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|string|confirmed|min:8',
        ]);

        // 2. Use the PasswordBroker to reset the password
        $status = Password::reset($request->all(), function (User $user, string $password) {
            $user->password = bcrypt($password);
            $user->save();
        });

        // 3. Check the status and return a response
        if ($status !== Password::PASSWORD_RESET) {
            return response()->json(['message' => __($status)], 400);
        }

        return response()->json([
            'message' => 'Password has been successfully reset.',
            'status' => __($status)
        ]);
    }
}
