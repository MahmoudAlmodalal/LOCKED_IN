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
    Schema::create('tasks', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->string('title');
        $table->text('description')->nullable();
        $table->enum('priority', ['Low', 'Medium', 'High'])->default('Medium');
        $table->enum('status', ['To Do', 'In Progress', 'Done'])->default('To Do');
        $table->timestamp('deadline')->nullable();
        $table->timestamps(); // Creates `created_at` and `updated_at`
        // Inside the Schema::create('tasks', ...) block
        $table->foreignId('category_id')->nullable()->constrained()->onDelete('set null');

    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
