<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TaskChecklist;
use App\Models\TaskAttachment;
use Illuminate\Http\Request;

class TaskDetailController extends Controller
{
    // ── Checklist ──────────────────────────────────────────
    public function addChecklist(Request $request, Task $task)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $item = $task->checklists()->create([
            'title'   => $validated['title'],
            'is_done' => false,
        ]);

        return response()->json(['message' => 'Checklist item added', 'item' => $item], 201);
    }

    public function toggleChecklist(Request $request, Task $task, TaskChecklist $checklist)
    {
        $checklist->update(['is_done' => !$checklist->is_done]);
        return response()->json(['message' => 'Checklist updated', 'item' => $checklist]);
    }

    public function deleteChecklist(Request $request, Task $task, TaskChecklist $checklist)
    {
        $checklist->delete();
        return response()->json(['message' => 'Checklist item deleted']);
    }

    // ── Attachments ────────────────────────────────────────
    public function addAttachment(Request $request, Task $task)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'url'  => 'required|url',
        ]);

        $attachment = $task->attachments()->create([
            'user_id' => $request->user()->id,
            'name'    => $validated['name'],
            'url'     => $validated['url'],
        ]);

        return response()->json([
            'message'    => 'Attachment added',
            'attachment' => $attachment->load('user:id,name'),
        ], 201);
    }

    public function deleteAttachment(Request $request, Task $task, TaskAttachment $attachment)
    {
        if ($attachment->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $attachment->delete();
        return response()->json(['message' => 'Attachment deleted']);
    }

    // ── Task Detail (full) ─────────────────────────────────
    public function show(Request $request, Task $task)
    {
        $task->load([
            'assignee:id,name,email',
            'comments.user:id,name,email',
            'checklists',
            'attachments.user:id,name,email',
            'project:id,name',
        ]);

        return response()->json($task);
    }
}