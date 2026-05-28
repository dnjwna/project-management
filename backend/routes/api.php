<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\MemberController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\TaskDetailController;
use App\Http\Controllers\Api\NotificationController;
use Illuminate\Http\Request;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/admin/users', function (Request $request) {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $users = \App\Models\User::paginate(20);
        return response()->json($users);
    });

    Route::delete('/admin/users/{user}', function (Request $request, \App\Models\User $user) {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        if ($request->user()->id === $user->id) {
            return response()->json(['message' => 'Cannot delete yourself'], 422);
        }
        $user->delete();
        return response()->json(['message' => 'User deleted']);
    });

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // Projects
    Route::apiResource('projects', ProjectController::class);

    // Tasks per project
    Route::get('projects/{project}/tasks', [TaskController::class, 'index']);
    Route::post('projects/{project}/tasks', [TaskController::class, 'store']);
    Route::get('projects/{project}/tasks/{task}', [TaskController::class, 'show']);
    Route::put('projects/{project}/tasks/{task}', [TaskController::class, 'update']);
    Route::patch('projects/{project}/tasks/{task}', [TaskController::class, 'update']);
    Route::delete('projects/{project}/tasks/{task}', [TaskController::class, 'destroy']);

    // Comments per task
    Route::post('tasks/{task}/comments', [TaskController::class, 'addComment']);
    Route::delete('tasks/{task}/comments/{comment}',  [TaskController::class, 'deleteComment']);

    // Members
    Route::get('projects/{project}/members', [MemberController::class, 'index']);
    Route::post('projects/{project}/members', [MemberController::class, 'store']);
    Route::delete('projects/{project}/members/{user}', [MemberController::class, 'destroy']);

    // Reports
    Route::get('reports/projects', [ReportController::class, 'projectSummary']);
    Route::get('reports/projects/{project}', [ReportController::class, 'projectDetail']);

    // Task Detail
    Route::get('tasks/{task}/detail', [TaskDetailController::class, 'show']);

    // Checklist
    Route::post('tasks/{task}/checklists', [TaskDetailController::class, 'addChecklist']);
    Route::patch('tasks/{task}/checklists/{checklist}/toggle', [TaskDetailController::class, 'toggleChecklist']);
    Route::delete('tasks/{task}/checklists/{checklist}', [TaskDetailController::class, 'deleteChecklist']);

    // Attachments
    Route::post('tasks/{task}/attachments', [TaskDetailController::class, 'addAttachment']);
    Route::delete('tasks/{task}/attachments/{attachment}', [TaskDetailController::class, 'deleteAttachment']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy']);
    Route::delete('/notifications', [NotificationController::class, 'clearAll']);
});
