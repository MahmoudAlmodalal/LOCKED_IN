<?php

namespace Tests\Feature\Authorization;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum; // Import Sanctum for authentication

class TaskAuthorizationTest extends TestCase
{
    use LazilyRefreshDatabase;

    protected User $userA;
    protected User $userB;
    protected Task $taskOfUserA;

    /**
     * Set up the testing environment.
     */
    protected function setUp(): void
    {
        parent::setUp();

        // Create two distinct users
        $this->userA = User::factory()->create();
        $this->userB = User::factory()->create();

        // Create a task that belongs to User A
        $this->taskOfUserA = Task::factory()->create(['user_id' => $this->userA->id]);
    }

    /**
     * Test: A user cannot view a single task belonging to another user.
     */
    public function test_a_user_cannot_view_another_users_task(): void
    {
        // Authenticate as User B
        Sanctum::actingAs($this->userB);

        // User B tries to access User A's task
        $response = $this->getJson('/tasks/' . $this->taskOfUserA->id);

        // Assert that the request is forbidden
        $response->assertStatus(403);
    }

    /**
     * Test: A user cannot update a task belonging to another user.
     */
    public function test_a_user_cannot_update_another_users_task(): void
    {
        // Authenticate as User B
        Sanctum::actingAs($this->userB);

        // User B tries to update User A's task
        $response = $this->putJson('/tasks/' . $this->taskOfUserA->id, [
            'title' => 'Updated by wrong user',
        ]);

        // Assert that the request is forbidden
        $response->assertStatus(403);
    }

    /**
     * Test: A user cannot delete a task belonging to another user.
     */
    public function test_a_user_cannot_delete_another_users_task(): void
    {
        // Authenticate as User B
        Sanctum::actingAs($this->userB);

        // User B tries to delete User A's task
        $response = $this->deleteJson('/tasks/' . $this->taskOfUserA->id);

        // Assert that the request is forbidden
        $response->assertStatus(403);
    }

    /**
     * Test: The index route only returns tasks belonging to the authenticated user.
     */
    public function test_the_task_index_route_is_scoped_to_the_authenticated_user(): void
    {
        // Create a task for User B as well
        $taskOfUserB = Task::factory()->create(['user_id' => $this->userB->id]);

        // Authenticate as User B
        Sanctum::actingAs($this->userB);

        // Fetch the list of tasks
        $response = $this->getJson('/tasks');

        $response
            ->assertStatus(200)
            // Assert that the task of User B is present in the response
            ->assertJsonFragment(['id' => $taskOfUserB->id])
            // Assert that the task of User A is NOT present in the response
            ->assertJsonMissing(['id' => $this->taskOfUserA->id]);
    }
    /**
     * Test: A Task Manager can successfully assign a task to another user.
     */
    public function test_a_task_manager_can_assign_a_task(): void
    {
        // Promote User A to Task Manager
        $this->userA->role = 'Task Manager';
        $this->userA->save();

        // Authenticate as the Task Manager (User A)
        Sanctum::actingAs($this->userA);

        $taskData = [
            'title' => 'Task assigned by Manager',
            // Assign the task to User B
            'user_id' => $this->userB->id,
        ];

        $response = $this->postJson('/tasks', $taskData);

        $response
            ->assertStatus(201) // Assert the task was created
            ->assertJson([
                'user_id' => $this->userB->id, // Assert it's owned by User B
                'creator_id' => $this->userA->id, // Assert it was created by User A
            ]);
    }

    /**
     * Test: An End User cannot assign a task to another user.
     */
    public function test_an_end_user_cannot_assign_a_task(): void
    {
        // Ensure User A is a regular End User (which is the default)

        // Authenticate as the End User (User A)
        Sanctum::actingAs($this->userA);

        $taskData = [
            'title' => 'Attempt to assign task by End User',
            // Try to assign the task to User B
            'user_id' => $this->userB->id,
        ];

        $response = $this->postJson('/tasks', $taskData);

        // Assert that the request is forbidden
        $response->assertStatus(403);
    }

}
