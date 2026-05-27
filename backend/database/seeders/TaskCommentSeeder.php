<?php

namespace Database\Seeders;

use App\Models\TaskComment;
use Illuminate\Database\Seeder;

class TaskCommentSeeder extends Seeder
{
    public function run(): void
    {
        $comments = [
            // Task 1
            ['task_id' => 1, 'user_id' => 2, 'comment' => 'Sudah selesai analisis 5 kompetitor utama, hasil terlampir di drive.'],
            ['task_id' => 1, 'user_id' => 1, 'comment' => 'Bagus, lanjut ke wireframe.'],

            // Task 2
            ['task_id' => 2, 'user_id' => 3, 'comment' => 'Wireframe homepage dan about sudah selesai, contact masih WIP.'],
            ['task_id' => 2, 'user_id' => 1, 'comment' => 'OKe, prioritaskan homepage dulu.'],

            // Task 3
            ['task_id' => 3, 'user_id' => 2, 'comment' => 'Sedang mengerjakan komponen header dan hero section.'],
            ['task_id' => 3, 'user_id' => 3, 'comment' => 'Kalau butuh asset desain bisa minta ke saya.'],

            // Task 7
            ['task_id' => 7, 'user_id' => 5, 'comment' => 'Fitur login sudah jalan, sekarang garap register.'],
            ['task_id' => 7, 'user_id' => 4, 'comment' => 'Jangan lupa implementasi refresh token ya.'],

            // Task 8
            ['task_id' => 8, 'user_id' => 4, 'comment' => 'Blocked karena API produk dari backend belum siap.'],
            ['task_id' => 8, 'user_id' => 1, 'comment' => 'Koordinasi dengan tim backend untuk estimasi selesainya.'],
        ];

        foreach ($comments as $comment) {
            TaskComment::create($comment);
        }
    }
}