<?php

namespace App\Console\Commands;

use App\Models\Task;
use App\Services\NotificationService;
use Illuminate\Console\Command;

class SendDueDateNotifications extends Command
{
    protected $signature   = 'notifications:due-dates';
    protected $description = 'Send notifications for tasks due soon or overdue';

    public function handle(): void
    {
        // Tasks due dalam 2 hari
        $dueSoon = Task::with(['project'])
            ->whereNotNull('assigned_to')
            ->whereNotNull('due_date')
            ->whereNot('status', 'done')
            ->whereBetween('due_date', [now()->startOfDay(), now()->addDays(2)->endOfDay()])
            ->get();

        foreach ($dueSoon as $task) {
            $daysLeft = now()->startOfDay()->diffInDays($task->due_date);
            NotificationService::send(
                $task->assigned_to,
                'due_soon',
                'Task due soon',
                "\"$task->title\" is due in $daysLeft day(s)",
                ['task_id' => $task->id, 'project_id' => $task->project_id]
            );
        }

        // Overdue tasks
        $overdue = Task::with(['project'])
            ->whereNotNull('assigned_to')
            ->whereNotNull('due_date')
            ->whereNot('status', 'done')
            ->where('due_date', '<', now()->startOfDay())
            ->get();

        foreach ($overdue as $task) {
            $daysOverdue = $task->due_date->diffInDays(now()->startOfDay());
            NotificationService::send(
                $task->assigned_to,
                'overdue',
                'Task overdue',
                "\"$task->title\" was due $daysOverdue day(s) ago",
                ['task_id' => $task->id, 'project_id' => $task->project_id]
            );
        }

        $this->info('Due date notifications sent successfully.');
    }
}