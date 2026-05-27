<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\User;
use Illuminate\Http\Request;

class MemberController extends Controller
{
    public function index(Request $request, Project $project)
    {
        if (!$request->user()->isAdmin() && !$project->members()->where('user_id', $request->user()->id)->exists()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $members = $project->members()->with('user:id,name,email,role')->get();

        return response()->json($members);
    }

    public function store(Request $request, Project $project)
    {
        if (!$request->user()->isAdmin() && !$this->isManager($project, $request->user()->id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'role'    => 'sometimes|in:manager,member',
        ]);

        $exists = $project->members()->where('user_id', $validated['user_id'])->exists();
        if ($exists) {
            return response()->json(['message' => 'User is already a member of this project'], 422);
        }

        $member = ProjectMember::create([
            'project_id' => $project->id,
            'user_id'    => $validated['user_id'],
            'role'       => $validated['role'] ?? 'member',
        ]);

        return response()->json([
            'message' => 'Member added successfully',
            'member'  => $member->load('user:id,name,email'),
        ], 201);
    }

    public function destroy(Request $request, Project $project, User $user)
    {
        if (!$request->user()->isAdmin() && !$this->isManager($project, $request->user()->id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($project->created_by === $user->id) {
            return response()->json(['message' => 'Cannot remove project creator'], 422);
        }

        $project->members()->where('user_id', $user->id)->delete();

        return response()->json(['message' => 'Member removed successfully']);
    }

    private function isManager(Project $project, int $userId): bool
    {
        return $project->members()->where('user_id', $userId)->where('role', 'manager')->exists();
    }
}