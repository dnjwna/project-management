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
        Schema::table('task_attachments', function (Blueprint $table) {
            $table->string('disk')->default('public')->after('url');
            $table->string('path')->nullable()->after('disk'); // path di storage
            $table->string('mime_type')->nullable()->after('path');
            $table->unsignedBigInteger('size')->nullable()->after('mime_type'); // bytes
            $table->enum('attachment_type', ['link', 'file'])->default('link')->after('size');
        });
    }

    public function down(): void
    {
        Schema::table('task_attachments', function (Blueprint $table) {
            $table->dropColumn(['disk', 'path', 'mime_type', 'size', 'attachment_type']);
        });
    }
};
