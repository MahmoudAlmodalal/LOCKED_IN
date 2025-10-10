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

        // 3. Load the tasks using the relationship with category.
        // We are now 100% sure that $user is a valid User object.
        $tasks = $user->tasks()->with('category')->latest()->get();

        // 4. Return the tasks.
        return response()->json($tasks);
    }


    /**
     * Store a newly created task in storage for the authenticated user.
     */
    public function store(Request $request)
    {
        // Get the authenticated user
        $user = $request->user();

        // Validate the incoming request data
        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'nullable|in:Low,Medium,High',
            'status' => 'nullable|in:To Do,In Progress,Done',
            'deadline' => 'nullable|date',
            'category_id' => 'nullable|exists:categories,id',
            // Add user_id to validation. It's optional.
            'user_id' => 'nullable|exists:users,id'
        ]);

        // --- AUTHORIZATION LOGIC ---
        $assigneeId = $validatedData['user_id'] ?? $user->id;

        // Check if a user is being assigned the task
        if ($assigneeId !== $user->id) {
            // If so, only allow it if the authenticated user is a Task Manager or Admin
            if ($user->role !== 'Task Manager' && $user->role !== 'Admin') {
                return response()->json(['message' => 'You do not have permission to assign tasks to other users.'], 403);
            }
        }

        // --- DATA PREPARATION ---
        // The creator is always the authenticated user
        $validatedData['creator_id'] = $user->id;
        // The owner (user_id) is the assignee, or the creator if no assignee is specified
        $validatedData['user_id'] = $assigneeId;

        // Create the task with the prepared data
        $task = Task::create($validatedData);
        
        // Load the category relationship
        $task->load('category');

        return response()->json($task, 201);
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
        // Get the authenticated user
        $user = $request->user();

        // Authorization: First, ensure the user can access this task at all.
        // For now, we'll stick with the owner check. A better solution would be a Policy.
        if ($user->id !== $task->user_id && $user->id !== $task->creator_id) {
             // Allow if user is the owner OR the creator (manager)
            if ($user->role !== 'Admin') { // Or some other logic for team visibility
                 return response()->json(['message' => 'Forbidden'], 403);
            }
        }

        // Validate the incoming request data
        $validatedData = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'nullable|in:Low,Medium,High',
            'status' => 'nullable|in:To Do,In Progress,Done',
            'deadline' => 'nullable|date',
            'category_id' => 'nullable|exists:categories,id',
            'user_id' => 'sometimes|required|exists:users,id'
        ]);

        // --- AUTHORIZATION LOGIC FOR RE-ASSIGNMENT ---
        // Check if the task is being re-assigned
        if (isset($validatedData['user_id']) && $validatedData['user_id'] !== $task->user_id) {
            // Only allow re-assignment if the authenticated user is a Task Manager or Admin
            if ($user->role !== 'Task Manager' && $user->role !== 'Admin') {
                return response()->json(['message' => 'You do not have permission to re-assign tasks.'], 403);
            }
        }

        // Update the task with the validated data
        $task->update($validatedData);
        
        // Load the category relationship
        $task->load('category');

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
