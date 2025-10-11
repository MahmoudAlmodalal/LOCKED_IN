<?php

namespace App\Jobs;

use App\Models\Habit;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Carbon\Carbon;

class UpdateHabitStreaks implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $habit;

    public function __construct(Habit $habit)
    {
        $this->habit = $habit;
    }

    public function handle(): void
    {
        $entries = $this->habit->entries()
            ->where('completed', true)
            ->orderBy('date', 'desc')
            ->get();

        if ($entries->isEmpty()) {
            $this->habit->streak = 0;
            $this->habit->save();
            return;
        }

        $streak = 0;
        $today = Carbon::today();
        $lastEntryDate = Carbon::parse($entries->first()->date);

        // If the last completion was not today or yesterday, the streak is broken.
        if ($today->diffInDays($lastEntryDate) > 1) {
            $streak = 0;
        } else {
            $streak = 1;
            for ($i = 1; $i < $entries->count(); $i++) {
                $currentEntryDate = Carbon::parse($entries[$i-1]->date);
                $previousEntryDate = Carbon::parse($entries[$i]->date);

                if ($currentEntryDate->diffInDays($previousEntryDate) == 1) {
                    $streak++;
                } else {
                    break;
                }
            }
        }

        $this->habit->streak = $streak;
        if ($streak > $this->habit->best_streak) {
            $this->habit->best_streak = $streak;
        }
        $this->habit->save();
    }
}
