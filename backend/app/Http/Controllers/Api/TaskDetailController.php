<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TaskChecklist;
use App\Models\TaskAttachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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

    // ── Link Attachment ────────────────────────────────────
    public function addAttachment(Request $request, Task $task)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'url'  => 'required|url',
        ]);

        $attachment = $task->attachments()->create([
            'user_id'         => $request->user()->id,
            'name'            => $validated['name'],
            'url'             => $validated['url'],
            'attachment_type' => 'link',
        ]);

        return response()->json([
            'message'    => 'Attachment added',
            'attachment' => $attachment->load('user:id,name'),
        ], 201);
    }

    // ── File Upload ────────────────────────────────────────
    public function uploadFile(Request $request, Task $task)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // max 10MB
        ]);

        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $mimeType = $file->getMimeType();
        $size = $file->getSize();;

        // Simpan ke storage/app/public/task-attachments/{task_id}/
        $path = $file->store("task-attachments/{$task->id}", 'public');

        $attachment = $task->attachments()->create([
            'user_id'         => $request->user()->id,
            'name'            => $originalName,
            'url'             => asset('storage/' . $path),
            'disk'            => 'public',
            'path'            => $path,
            'mime_type'       => $mimeType,
            'size'            => $size,
            'attachment_type' => 'file',
        ]);

        return response()->json([
            'message'    => 'File uploaded successfully',
            'attachment' => $attachment->load('user:id,name'),
        ], 201);
    }

    // ── Delete Attachment ──────────────────────────────────
    public function deleteAttachment(Request $request, Task $task, TaskAttachment $attachment)
    {
        if ($attachment->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Hapus file fisik kalau tipe file
        if ($attachment->attachment_type === 'file' && $attachment->path) {
            Storage::disk('public')->delete($attachment->path);
        }

        $attachment->delete();

        return response()->json(['message' => 'Attachment deleted']);
    }

    // ── Task Detail ────────────────────────────────────────
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