<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // No-op duplicate migration. The habits table is created in an earlier migration.
        // Keeping this file to preserve migration history without causing conflicts.
        if (!Schema::hasTable('habits')) {
            // In case the earlier migration is missing in some environments, create a minimal table
            // (It's recommended to run the earlier full migration instead).
            Schema::create('habits', function (Blueprint $table) {
                $table->id();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Do not drop the table here to avoid unintended data loss if the earlier
        // migration created the full schema. Safely check existence first.
        if (Schema::hasTable('habits')) {
            // Intentionally not dropping to prevent conflicts with main migration.
        }
    }
};
