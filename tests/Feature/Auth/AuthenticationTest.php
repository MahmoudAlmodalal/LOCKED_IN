<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase; // Resets the database for each test
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

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

        $response = $this->postJson('/api/register', $userData);

        $response
            ->assertStatus(201) // Assert "Created" status
            ->assertJsonStructure(['message', 'user', 'access_token']); // Assert response structure

        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
        ]); // Assert user exists in the database
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

        $response = $this->postJson('/api/register', $userData);

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

        $response = $this->postJson('/api/login', $loginData);

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

        $response = $this->postJson('/api/login', $loginData);

        $response
            ->assertStatus(401) // Assert "Unauthorized" status
            ->assertJson(['message' => 'Invalid login credentials']);
    }
}
