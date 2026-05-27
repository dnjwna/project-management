<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function projectSummary(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $projects = Project::withCount([
            'tasks',
            'tasks as done_tasks_count'     => fn($q) => $q->where('status', 'done'),
            'tasks as blocked_tasks_count'  => fn($q) => $q->where('status', 'blocked'),
        ])->get()->map(function ($project) {
            $project->progress = $project->tasks_count > 0
                ? (int) round(($project->done_tasks_count / $project->tasks_count) * 100)
                : 0;
            return $project;
        });

        $summary = [
            'total_projects'     => $projects->count(),
            'on_track'           => $projects->where('status', 'on_track')->count(),
            'delayed'            => $projects->where('status', 'delayed')->count(),
            'completed'          => $projects->where('status', 'completed')->count(),
            'projects'           => $projects,
        ];

        return response()->json($summary);
    }

    public function projectDetail(Request $request, Project $project)
    {
        if (!$request->user()->isAdmin() && !$project->members()->where('user_id', $request->user()->id)->exists()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $tasks = $project->tasks()->with('assignee:id,name,email')->get();

        $report = [
            'project'         => $project->load('creator:id,name,email'),
            'progress'        => $project->progress,
            'total_tasks'     => $tasks->count(),
            'by_status'       => [
                'todo'        => $tasks->where('status', 'todo')->count(),
                'in_progress' => $tasks->where('status', 'in_progress')->count(),
                'done'        => $tasks->where('status', 'done')->count(),
                'blocked'     => $tasks->where('status', 'blocked')->count(),
            ],
            'by_priority'     => [
                'high'        => $tasks->where('priority', 'high')->count(),
                'medium'      => $tasks->where('priority', 'medium')->count(),
                'low'         => $tasks->where('priority', 'low')->count(),
            ],
            'members'         => $project->members()->with('user:id,name,email')->get(),
            'overdue_tasks'   => $tasks->filter(fn($t) => $t->due_date && $t->due_date->isPast() && $t->status !== 'done')->values(),
        ];

        return response()->json($report);
    }
}