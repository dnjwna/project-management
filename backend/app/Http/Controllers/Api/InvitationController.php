<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\InvitationMail;
use App\Models\Invitation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class InvitationController extends Controller
{
    // Admin kirim undangan
    public function send(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'email' => 'required|email|unique:users,email',
            'role'  => 'sometimes|in:admin,member',
        ]);

        // Hapus invitation lama (apapun statusnya)
        Invitation::where('email', $validated['email'])->delete();

        $invitation = Invitation::create([
            'email'      => $validated['email'],
            'role'       => $validated['role'] ?? 'member',
            'token'      => Str::random(64),
            'status'     => 'pending',
            'expires_at' => now()->addHours(48),
            'invited_by' => $request->user()->id,
        ]);

        Mail::to($invitation->email)->send(new InvitationMail($invitation));

        return response()->json([
            'message'    => 'Invitation sent successfully',
            'invitation' => [
                'email'      => $invitation->email,
                'role'       => $invitation->role,
                'expires_at' => $invitation->expires_at,
                'status'     => $invitation->status,
            ],
        ], 201);
    }

    // Validate token
    public function validate(string $token)
    {
        $invitation = Invitation::where('token', $token)->first();

        if (!$invitation || !$invitation->isPending()) {
            // Mark as expired kalau sudah lewat
            if ($invitation && $invitation->expires_at->isPast()) {
                $invitation->update(['status' => 'expired']);
            }

            return response()->json([
                'valid'   => false,
                'message' => 'Invitation link is invalid or has expired.',
            ], 422);
        }

        return response()->json([
            'valid' => true,
            'email' => $invitation->email,
            'role'  => $invitation->role,
        ]);
    }

    // Accept invitation & register
    public function accept(Request $request)
    {
        $validated = $request->validate([
            'token'    => 'required|string',
            'name'     => 'required|string|max:255',
            'password' => 'required|string|min:8|confirmed',
        ]);

        DB::beginTransaction();

        try {
            $invitation = Invitation::where('token', $validated['token'])
                ->lockForUpdate()
                ->first();

            if (!$invitation || !$invitation->isPending()) {
                DB::rollBack();
                return response()->json([
                    'message' => 'Invitation link is invalid or has expired.',
                ], 422);
            }

            // Cek email belum terdaftar
            if (User::where('email', $invitation->email)->exists()) {
                DB::rollBack();
                return response()->json([
                    'message' => 'This email is already registered.',
                ], 422);
            }

            // Buat user
            $user = User::create([
                'name'     => $validated['name'],
                'email'    => $invitation->email,
                'password' => Hash::make($validated['password']),
                'role'     => $invitation->role,
            ]);

            // Update invitation status
            $invitation->update(['status' => 'accepted']);

            DB::commit();

            return response()->json([
                'message' => 'Registration successful. You can now log in.',
                'user'    => [
                    'name'  => $user->name,
                    'email' => $user->email,
                    'role'  => $user->role,
                ],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Something went wrong. Please try again.'], 500);
        }
    }

    // List invitations (admin)
    public function index(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $invitations = Invitation::with('inviter:id,name')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($invitations);
    }

    // Revoke invitation (admin)
    public function revoke(Request $request, Invitation $invitation)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $invitation->update(['status' => 'expired']);

        return response()->json(['message' => 'Invitation revoked']);
    }
}
