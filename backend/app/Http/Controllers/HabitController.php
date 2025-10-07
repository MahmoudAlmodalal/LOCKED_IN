<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Habit;
use Illuminate\Support\Facades\Auth;

class HabitController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $habits = Habit::where('user_id', (int) $user->id)->get();
        return response()->json($habits);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'frequency' => 'required|string|in:daily,weekly,monthly',
            'target' => 'required|integer',
            'unit' => 'required|string|max:50',
            'color' => 'nullable|string|max:50',
            'icon' => 'nullable|string|max:100',
            'is_active' => 'boolean',
        ]);
        $habit = Habit::create(array_merge($validated, [
            'user_id' => $user->id,
            'streak' => 0,
        ]));
        return response()->json($habit, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $habit = Habit::findOrFail($id);
        $this->authorizeHabit($habit);
        return response()->json($habit);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $habit = Habit::findOrFail($id);
        $this->authorizeHabit($habit);
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'frequency' => 'sometimes|required|string|in:daily,weekly,monthly',
            'target' => 'sometimes|required|integer',
            'unit' => 'sometimes|required|string|max:50',
            'color' => 'nullable|string|max:50',
            'icon' => 'nullable|string|max:100',
            'is_active' => 'boolean',
            'streak' => 'integer',
        ]);
        $habit->update($validated);
        return response()->json($habit);
    }
    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $habit = Habit::findOrFail($id);
        $this->authorizeHabit($habit);
        $habit->delete();
        return response()->json(['message' => 'Habit deleted successfully']);
    }

    /**
     * Ensure the habit belongs to the authenticated user.
     */
    protected function authorizeHabit(Habit $habit)
    {
        if (Auth::id() !== $habit->user_id) {
            abort(403, 'Unauthorized');
        }
    }

}
