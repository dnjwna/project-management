<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectMember;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $query = Project::with(['creator:id,name,email', 'members.user:id,name,email'])
            ->withCount('tasks');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if (!$request->user()->isAdmin()) {
            $query->whereHas('members', function ($q) use ($request) {
                $q->where('user_id', $request->user()->id);
            });
        }

        $projects = $query->paginate($request->get('limit', 10));

        return response()->json($projects);
    }

    public function store(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'status'      => 'sometimes|in:on_track,delayed,completed',
            'start_date'  => 'required|date',
            'end_date'    => 'required|date|after_or_equal:start_date',
        ]);

        $project = Project::create([
            ...$validated,
            'created_by' => $request->user()->id,
        ]);

        ProjectMember::create([
            'project_id' => $project->id,
            'user_id'    => $request->user()->id,
            'role'       => 'manager',
        ]);

        return response()->json([
            'message' => 'Project created successfully',
            'project' => $project->load('creator:id,name,email'),
        ], 201);
    }

    public function show(Request $request, Project $project)
    {
        if (!$request->user()->isAdmin() && !$this->isMember($project, $request->user()->id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $project->load([
            'creator:id,name,email',
            'members.user:id,name,email',
            'tasks.assignee:id,name,email',
        ]);

        $project->append('progress');

        return response()->json($project);
    }

    public function update(Request $request, Project $project)
    {
        if (!$request->user()->isAdmin() && !$this->isManager($project, $request->user()->id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'status'      => 'sometimes|in:on_track,delayed,completed',
            'start_date'  => 'sometimes|date',
            'end_date'    => 'sometimes|date|after_or_equal:start_date',
        ]);

        $project->update($validated);

        return response()->json([
            'message' => 'Project updated successfully',
            'project' => $project->fresh()->append('progress'),
        ]);
    }

    public function destroy(Request $request, Project $project)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $project->delete();

        return response()->json(['message' => 'Project deleted successfully']);
    }

    private function isMember(Project $project, int $userId): bool
    {
        return $project->members()->where('user_id', $userId)->exists();
    }

    private function isManager(Project $project, int $userId): bool
    {
        return $project->members()->where('user_id', $userId)->where('role', 'manager')->exists();
    }
}