<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    
    public function run(): void
    {
        User::factory(5)->hasTasks(3)->create();
        $demoUser = User::factory()->create([
            'name' => 'Recruiter Demo',
            'email' => 'demo@taskflow.io',
            'password' => bcrypt('password123'),
        ]);
        \App\Models\Task::factory(15)->create([
            'user_id' => $demoUser->id
        ]);
    }
}
