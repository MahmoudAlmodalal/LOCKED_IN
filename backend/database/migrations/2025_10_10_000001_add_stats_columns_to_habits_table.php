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
        Schema::table('habits', function (Blueprint $table) {
            if (!Schema::hasColumn('habits', 'best_streak')) {
                $table->integer('best_streak')->default(0)->after('streak');
            }
            if (!Schema::hasColumn('habits', 'total_completions')) {
                $table->integer('total_completions')->default(0)->after('best_streak');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('habits', function (Blueprint $table) {
            if (Schema::hasColumn('habits', 'best_streak')) {
                $table->dropColumn('best_streak');
            }
            if (Schema::hasColumn('habits', 'total_completions')) {
                $table->dropColumn('total_completions');
            }
        });
    }
};
