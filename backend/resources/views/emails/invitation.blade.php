<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>You're Invited to FlowStep</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, sans-serif; background: #F8F9FA; color: #1E293B; }
    .wrapper { max-width: 560px; margin: 40px auto; }
    .card { background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: #1E293B; padding: 32px; text-align: center; }
    .logo { display: inline-flex; align-items: center; gap: 10px; }
    .logo-icon { width: 36px; height: 36px; background: #10B981; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .logo-text { color: #ffffff; font-size: 20px; font-weight: 700; }
    .body { padding: 40px 32px; }
    .greeting { font-size: 22px; font-weight: 700; color: #1E293B; margin-bottom: 12px; }
    .text { font-size: 15px; color: #64748B; line-height: 1.7; margin-bottom: 16px; }
    .role-badge { display: inline-block; background: #ECFDF5; color: #059669; font-size: 13px; font-weight: 600; padding: 4px 12px; border-radius: 999px; border: 1px solid #A7F3D0; margin-bottom: 28px; text-transform: capitalize; }
    .btn-wrap { text-align: center; margin-bottom: 28px; }
    .btn { display: inline-block; background: #1E293B; color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 12px; font-size: 15px; font-weight: 600; letter-spacing: 0.01em; }
    .divider { border: none; border-top: 1px solid #F1F5F9; margin: 24px 0; }
    .url-box { background: #F8F9FA; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px 16px; word-break: break-all; font-size: 12px; color: #94A3B8; }
    .expiry { font-size: 13px; color: #94A3B8; text-align: center; margin-top: 16px; }
    .footer { background: #F8F9FA; padding: 20px 32px; text-align: center; }
    .footer p { font-size: 12px; color: #94A3B8; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <!-- Header -->
      <div class="header">
        <div class="logo">
          <div style="width:36px;height:36px;background:#10B981;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;">
            <span style="color:#fff;font-weight:700;font-size:14px;">PM</span>
          </div>
          <span style="color:#fff;font-size:20px;font-weight:700;margin-left:10px;">FlowStep</span>
        </div>
      </div>

      <!-- Body -->
      <div class="body">
        <p class="greeting">You've been invited! 🎉</p>
        <p class="text">
          <strong>{{ $inviterName }}</strong> has invited you to join <strong>FlowStep</strong> as a team member.
        </p>
        <div>
          <span class="role-badge">{{ $role }}</span>
        </div>
        <p class="text">
          Click the button below to create your account and get started. This invitation link will expire on <strong>{{ $expiresAt }}</strong>.
        </p>

        <div class="btn-wrap">
          <a href="{{ $registerUrl }}" class="btn">Accept Invitation</a>
        </div>

        <hr class="divider" />

        <p style="font-size:13px;color:#94A3B8;margin-bottom:8px;">Or copy this link to your browser:</p>
        <div class="url-box">{{ $registerUrl }}</div>

        <p class="expiry">⏰ This link expires on {{ $expiresAt }}</p>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p>If you didn't expect this invitation, you can safely ignore this email.<br/>© 2026 FlowStep. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>