<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class TaskApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_fetch_tasks()
    {
        $response = $this->getJson('/api/tasks');

        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_fetch_their_tasks()
    {
        $user = \App\Models\User::factory()->create();
        \App\Models\Task::factory(3)->create([
            'user_id' => $user->id
        ]);

        $response = $this->actingAs($user)->getJson('/api/tasks');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'message',
                     'data' => [
                         'data', 'current_page', 'last_page'
                     ]
                 ]);
        
        $this->assertCount(3, $response->json('data.data'));
    }

    public function test_user_cannot_fetch_others_tasks()
    {
        $user1 = \App\Models\User::factory()->create();
        $user2 = \App\Models\User::factory()->create();

        // Task belonging to user 1
        $task = \App\Models\Task::factory()->create([
            'user_id' => $user1->id
        ]);

        // User 2 tries to fetch user 1's task
        $response = $this->actingAs($user2)->getJson('/api/tasks/' . $task->id);

        $response->assertStatus(404);
    }
}
