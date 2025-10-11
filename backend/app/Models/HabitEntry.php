<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HabitEntry extends Model
{
    use \Illuminate\Database\Eloquent\Factories\HasFactory;

    protected $fillable = [
        'habit_id',
        'user_id',
        'date',
        'completed',
        'value',
    ];

    protected $casts = [
        'date' => 'date',
        'completed' => 'boolean',
    ];

    public function habit()
    {
        return $this->belongsTo(Habit::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
