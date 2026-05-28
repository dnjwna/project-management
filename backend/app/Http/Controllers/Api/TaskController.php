<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Task;
use App\Models\TaskComment;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(Request $request, Project $project)
    {
        $this->checkProjectAccess($request, $project);

        $query = $project->tasks()->with('assignee:id,name,email');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        if (!$request->user()->isAdmin()) {
            $isMember = $project->members()
                ->where('user_id', $request->user()->id)
                ->where('role', 'member')
                ->exists();

            if ($isMember) {
                $query->where('assigned_to', $request->user()->id);
            }
        }

        $tasks = $query->paginate($request->get('limit', 10));

        return response()->json($tasks);
    }

    public function store(Request $request, Project $project)
    {
        if (!$request->user()->isAdmin() && !$this->isManager($project, $request->user()->id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'status'      => 'sometimes|in:todo,in_progress,done,blocked',
            'priority'    => 'sometimes|in:low,medium,high',
            'due_date'    => 'nullable|date',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        if (!empty($validated['assigned_to'])) {
            $isMember = $project->members()
                ->where('user_id', $validated['assigned_to'])
                ->exists();

            if (!$isMember) {
                return response()->json([
                    'message' => 'Assigned user is not a member of this project',
                ], 422);
            }
        }

        $task = $project->tasks()->create($validated);

        // Trigger notifikasi saat task baru dibuat dan di-assign ke seseorang
        if (!empty($validated['assigned_to'])) {
            NotificationService::taskAssigned(
                $validated['assigned_to'],
                $task->title,
                $project->name,
                $task->id,
                $project->id
            );
        }

        return response()->json([
            'message' => 'Task created successfully',
            'task'    => $task->load('assignee:id,name,email'),
        ], 201);
    }

    public function show(Request $request, Project $project, Task $task)
    {
        $this->checkProjectAccess($request, $project);

        $task->load(['assignee:id,name,email', 'comments.user:id,name,email']);

        return response()->json($task);
    }

    public function update(Request $request, Project $project, Task $task)
    {
        $user = $request->user();
        $isManagerOrAdmin = $user->isAdmin() || $this->isManager($project, $user->id);
        $isAssignee = $task->assigned_to === $user->id;

        if (!$isManagerOrAdmin && !$isAssignee) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!$isManagerOrAdmin && $isAssignee) {
            $validated = $request->validate([
                'status' => 'required|in:todo,in_progress,done,blocked',
            ]);
        } else {
            $validated = $request->validate([
                'title'       => 'sometimes|string|max:255',
                'description' => 'nullable|string',
                'status'      => 'sometimes|in:todo,in_progress,done,blocked',
                'priority'    => 'sometimes|in:low,medium,high',
                'due_date'    => 'nullable|date',
                'assigned_to' => 'nullable|exists:users,id',
            ]);
        }

        $task->update($validated);

        // Trigger notifikasi saat status task diubah menjadi blocked
        if (isset($validated['status']) && $validated['status'] === 'blocked' && $task->assigned_to) {
            NotificationService::taskBlocked(
                $task->assigned_to,
                $task->title,
                $project->name,
                $task->id,
                $project->id
            );
        }

        return response()->json([
            'message' => 'Task updated successfully',
            'task'    => $task->fresh()->load('assignee:id,name,email'),
        ]);
    }

    public function destroy(Request $request, Project $project, Task $task)
    {
        // Pengecekan akses: Hanya Admin atau Manager proyek yang boleh menghapus task
        if (!$request->user()->isAdmin() && !$this->isManager($project, $request->user()->id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Eksekusi hapus task
        $task->delete();

        return response()->json([
            'message' => 'Task deleted successfully'
        ]);
    }

    public function addComment(Request $request, Task $task)
    {
        $validated = $request->validate([
            'comment' => 'required|string',
        ]);

        $comment = $task->comments()->create([
            'user_id' => $request->user()->id,
            'comment' => $validated['comment'],
        ]);

        // Trigger notifikasi saat ada komentar baru
        $task->load('project');
        if ($task->assigned_to && $task->assigned_to !== $request->user()->id) {
            NotificationService::commentAdded(
                $task->assigned_to,
                $request->user()->name,
                $task->title,
                $task->id,
                $task->project_id
            );
        }

        return response()->json([
            'message' => 'Comment added',
            'comment' => $comment->load('user:id,name,email'),
        ], 201);
    }

    public function deleteComment(Request $request, Task $task, TaskComment $comment)
    {
        if ($comment->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'Comment deleted']);
    }

    private function checkProjectAccess(Request $request, Project $project): void
    {
        if (!$request->user()->isAdmin() && !$project->members()->where('user_id', $request->user()->id)->exists()) {
            abort(403, 'Unauthorized');
        }
    }

    private function isManager(Project $project, int $userId): bool
    {
        return $project->members()->where('user_id', $userId)->where('role', 'manager')->exists();
    }
}