<?php

namespace Tests\Feature\Auth;

use App\Models\User;
// 1. REMOVE the old trait
// use Illuminate\Foundation\Testing\RefreshDatabase;

// 2. IMPORT and USE the new, more robust trait
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use LazilyRefreshDatabase; // 3. USE the new trait here

    /**
     * Test: A new user can successfully register.
     */
    public function test_a_user_can_register_successfully(): void
    {
        $userData = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ];

        // The URL does not need the '/api' prefix in tests
        $response = $this->postJson('/register', $userData);

        $response
            ->assertStatus(201)
            ->assertJsonStructure(['message', 'user', 'access_token']);

        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
        ]);
    }

    /**
     * Test: Registration fails with an existing email.
     */
    public function test_registration_fails_with_an_existing_email(): void
    {
        // First, create a user
        User::factory()->create(['email' => 'test@example.com']);

        // Then, try to register with the same email
        $userData = [
            'name' => 'Another User',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ];

        $response = $this->postJson('/register', $userData);

        $response
            ->assertStatus(422) // Assert "Unprocessable Entity" status for validation failure
            ->assertJsonValidationErrors('email'); // Assert the validation error is for the 'email' field
    }

    /**
     * Test: A registered user can successfully log in.
     */
    public function test_a_user_can_login_successfully(): void
    {
        // Create a user to log in with
        $user = User::factory()->create([
            'password' => bcrypt('Password123!'),
        ]);

        $loginData = [
            'email' => $user->email,
            'password' => 'Password123!',
        ];

        $response = $this->postJson('/login', $loginData);

        $response
            ->assertStatus(200) // Assert "OK" status
            ->assertJsonStructure(['message', 'access_token']);
    }

    /**
     * Test: Login fails with incorrect credentials.
     */
    public function test_login_fails_with_incorrect_password(): void
    {
        $user = User::factory()->create();

        $loginData = [
            'email' => $user->email,
            'password' => 'wrong-password',
        ];

        $response = $this->postJson('/login', $loginData);

        $response
            ->assertStatus(401) // Assert "Unauthorized" status
            ->assertJson(['message' => 'Invalid login credentials']);
    }
}
