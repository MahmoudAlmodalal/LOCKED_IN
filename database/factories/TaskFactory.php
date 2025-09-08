<?php

namespace Database\Factories;

use App\Models\User; // Import the User model
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Task>
 */
class TaskFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // By default, associate the task with a new user.
            // This can be overridden in the test.
            'user_id' => User::factory(),
            'title' => $this->faker->sentence(4), // A fake sentence with 4 words
            'description' => $this->faker->paragraph(2), // A fake paragraph with 2 sentences
            'priority' => $this->faker->randomElement(['Low', 'Medium', 'High']),
            'status' => $this->faker->randomElement(['To Do', 'In Progress', 'Done']),
            'deadline' => $this->faker->dateTimeBetween('+1 week', '+1 month'), // A fake date in the future
        ];
    }
}
