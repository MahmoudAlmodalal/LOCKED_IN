<?php

namespace App\Http\Controllers;

use App\Models\PomodoroSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PomodoroSessionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return PomodoroSession::where('user_id', Auth::id())->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'start_time' => 'required|date',
            'type' => 'required|string',
        ]);

        $session = PomodoroSession::create([
            'user_id' => Auth::id(),
            'start_time' => $request->start_time,
            'type' => $request->type,
        ]);

        return response()->json($session, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(PomodoroSession $pomodoroSession)
    {
        return $pomodoroSession;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PomodoroSession $pomodoroSession)
    {
        $request->validate([
            'end_time' => 'required|date',
            'status' => 'required|string',
        ]);

        $pomodoroSession->update($request->all());

        return response()->json($pomodoroSession);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PomodoroSession $pomodoroSession)
    {
        $pomodoroSession->delete();

        return response()->json(null, 204);
    }
}
