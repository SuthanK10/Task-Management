<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Generate 5 random generic users with 3 tasks each
        User::factory(5)->hasTasks(3)->create();

        // Create a specific Demo User for the recruiter to test easily
        $demoUser = User::factory()->create([
            'name' => 'Recruiter Demo',
            'email' => 'demo@taskflow.io',
            'password' => bcrypt('password123'),
        ]);

        // Attach 15 random tasks uniquely to this demo user
        \App\Models\Task::factory(15)->create([
            'user_id' => $demoUser->id
        ]);
    }
}
