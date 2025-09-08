<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    /**
     * Display a listing of the authenticated user's tasks.
     */
        /**
     * Display a listing of the authenticated user's tasks.
     */
    public function index(Request $request)
    {
        // 1. Get the authenticated user from the request.
        // This is the most reliable way to get the user in an API context.
        $user = $request->user();

        // 2. Check if the user was actually found.
        if (!$user) {
            // This case should theoretically not be hit because of the 'auth:sanctum' middleware,
            // but it's good practice to handle it.
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // 3. Load the tasks using the relationship.
        // We are now 100% sure that $user is a valid User object.
        $tasks = $user->tasks()->latest()->get();

        // 4. Return the tasks.
        return response()->json($tasks);
    }


    /**
     * Store a newly created task in storage for the authenticated user.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        // Validate the incoming request data
        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'nullable|in:Low,Medium,High',
            'status' => 'nullable|in:To Do,In Progress,Done',
            'deadline' => 'nullable|date',
            'category_id' => 'nullable|exists:categories,id', // Ensure the category exists
        ]);

        // Create the task and associate it with the authenticated user
        $task = $user->tasks()->create($validatedData);

        return response()->json($task, 201); // 201 Created
    }

    /**
     * Display the specified task, if it belongs to the user.
     */
    public function show(Task $task)
    {
        // Authorization: Ensure the authenticated user owns this task
        if (Auth::id() !== $task->user_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($task);
    }

    /**
     * Update the specified task in storage, if it belongs to the user.
     */
    public function update(Request $request, Task $task)
    {
        // Authorization: Ensure the authenticated user owns this task
        if (Auth::id() !== $task->user_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Validate the incoming request data
        $validatedData = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'nullable|in:Low,Medium,High',
            'status' => 'nullable|in:To Do,In Progress,Done',
            'deadline' => 'nullable|date',
            'category_id' => 'nullable|exists:categories,id',
        ]);

        // Update the task with the validated data
        $task->update($validatedData);

        return response()->json($task);
    }

    /**
     * Remove the specified task from storage, if it belongs to the user.
     */
    public function destroy(Task $task)
    {
        // Authorization: Ensure the authenticated user owns this task
        if (Auth::id() !== $task->user_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Delete the task
        $task->delete();

        // Return a 204 No Content response, indicating success with no body
        return response()->noContent();
    }
}
