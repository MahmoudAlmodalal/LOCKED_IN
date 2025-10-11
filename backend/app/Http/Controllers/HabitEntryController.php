<?php

namespace App\Http\Controllers;

use App\Models\Habit;
use App\Models\HabitEntry;
use App\Jobs\UpdateHabitStreaks;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class HabitEntryController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'habit_id' => 'sometimes|exists:habits,id',
        ]);

        $query = Auth::user()->habitEntries();

        if ($request->has('habit_id')) {
            $query->where('habit_id', $request->habit_id);
        }

        return $query->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'habit_id' => 'required|exists:habits,id',
            'date' => 'required|date',
            'completed' => 'required|boolean',
            'value' => 'nullable|integer',
        ]);

        $habit = Habit::find($validated['habit_id']);
        if ($habit->user_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $entry = HabitEntry::updateOrCreate(
            [
                'habit_id' => $validated['habit_id'],
                'date' => $validated['date'],
                'user_id' => Auth::id(),
            ],
            [
                'completed' => $validated['completed'],
                'value' => $validated['value'] ?? null,
            ]
        );

        UpdateHabitStreaks::dispatchSync($habit);

        return response()->json($entry, 201);
    }

    public function show(HabitEntry $habitEntry)
    {
        if ($habitEntry->user_id !== Auth::id()) {
            return response()->json(['message' => 'Not Found'], 404);
        }
        return $habitEntry;
    }

    public function update(Request $request, HabitEntry $habitEntry)
    {
        if ($habitEntry->user_id !== Auth::id()) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        $validated = $request->validate([
            'completed' => 'sometimes|boolean',
            'value' => 'nullable|integer',
        ]);

        $habitEntry->update($validated);

        UpdateHabitStreaks::dispatchSync($habitEntry->habit);

        return $habitEntry;
    }

    public function destroy(HabitEntry $habitEntry)
    {
        if ($habitEntry->user_id !== Auth::id()) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        $habit = $habitEntry->habit;
        $habitEntry->delete();
        UpdateHabitStreaks::dispatchSync($habit);

        return response()->noContent();
    }
}
