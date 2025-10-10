<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CalendarEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'start',
        'end',
        'all_day',
        'type',
        'source_id',
        'source_type',
        'color',
    ];

    protected $casts = [
        'start' => 'datetime',
        'end' => 'datetime',
        'all_day' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
