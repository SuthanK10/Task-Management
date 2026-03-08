<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;


class TaskFactory extends Factory
{
    
    public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::factory(), // Will create a user if not provided
            'title' => fake()->sentence(4),
            'description' => fake()->boolean(70) ? fake()->paragraph() : null,
            'status' => fake()->randomElement(['pending', 'completed']),
            'due_date' => fake()->boolean(60) ? fake()->dateTimeBetween('now', '+1 month')->format('Y-m-d') : null,
        ];
    }
}
