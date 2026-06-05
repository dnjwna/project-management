<?php

namespace App\Mail;

use App\Models\Invitation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Invitation $invitation) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'You\'re invited to join FlowStep',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.invitation',
            with: [
                'inviterName' => $this->invitation->inviter->name,
                'role'        => $this->invitation->role,
                'registerUrl' => env('FRONTEND_URL', 'http://localhost:5173') . "/register?token={$this->invitation->token}",
                'expiresAt'   => $this->invitation->expires_at->format('d M Y, H:i'),
            ],
        );
    }
}