<?php

namespace App\Services;

use App\Events\NotificationSent;
use App\Models\Notification;

class NotificationService
{
    public static function send(int $userId, string $type, string $title, string $message, array $data = []): void
    {
        // Cek duplikat: Apakah sudah ada notifikasi dengan tipe dan task_id yang sama dalam 1 menit terakhir?
        // $exists = Notification::where('user_id', $userId)
        //     ->where('type', $type)
        //     ->where('data->task_id', $data['task_id'] ?? null) 
        //     ->where('created_at', '>=', now()->subMinute())
        //     ->exists();

        $exists = false; // Nonaktifkan pengecekan duplikat untuk semua jenis notifikasi
        if (!$exists) {
            $notification = Notification::create([
                'user_id' => $userId,
                'type'    => $type,
                'title'   => $title,
                'message' => $message,
                'data'    => $data,
                'is_read' => false,
            ]);

            // Broadcast real-time
            broadcast(new NotificationSent($notification));
        }
    }

    public static function taskAssigned(int $userId, string $taskTitle, string $projectName, int $taskId, int $projectId): void
    {
        self::send($userId, 'task_assigned', 'New task assigned to you', "\"$taskTitle\" in $projectName", [
            'task_id' => $taskId,
            'project_id' => $projectId
        ]);
    }

    public static function commentAdded(int $userId, string $commenterName, string $taskTitle, int $taskId, int $projectId): void
    {
        self::send($userId, 'comment_added', "$commenterName commented on a task", "On \"$taskTitle\"", [
            'task_id' => $taskId,
            'project_id' => $projectId
        ]);
    }

    public static function taskBlocked(int $userId, string $taskTitle, string $projectName, int $taskId, int $projectId): void
    {
        self::send($userId, 'task_blocked', 'Task is blocked', "\"$taskTitle\" in $projectName needs attention", [
            'task_id' => $taskId,
            'project_id' => $projectId
        ]);
    }
    public static function attachmentAdded(int $userId, string $uploaderName, string $taskTitle, int $taskId, int $projectId): void
    {
        self::send(
            $userId,
            'attachment_added',
            "$uploaderName added an attachment",
            "On \"$taskTitle\"",
            ['task_id' => $taskId, 'project_id' => $projectId]
        );
    }
}
