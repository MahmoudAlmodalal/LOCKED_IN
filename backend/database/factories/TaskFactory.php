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
            // By default, the creator and the user are the same.
            // We create a closure so that user_id is set first.
            'user_id' => User::factory(),
            'creator_id' => function (array $attributes) {
                return $attributes['user_id'];
            },
            'title' => $this->faker->sentence(4),
            'description' => $this->faker->paragraph(2),
            'priority' => $this->faker->randomElement(['Low', 'Medium', 'High']),
            'status' => $this->faker->randomElement(['To Do', 'In Progress', 'Done']),
            'deadline' => $this->faker->dateTimeBetween('+1 week', '+1 month'),
        ];
    }

}
