import requests
from app.core.config import RESEND_KEY

def send_otp_email(email: str, otp: str):
    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {RESEND_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "from": "no-reply@flamin.live",
        "to": [email],
        "subject": "Your OTP for Account Verification",
        "html": f"""
        <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification</title>
</head>
<body style="background-color: #F9FAFB; font-family: sans-serif; color: #374151; padding: 0; margin: 0;">
  <div style="max-width: 600px; margin: 40px auto; padding: 32px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);">
    <header style="text-align: center;">
      <div style="font-size: 32px; font-weight: bold; color: #1F2937;">MindSync</div>
    </header>

    <main style="margin-top: 32px;">
      <h2 style="color: #374151;">Hey!</h2>

      <p style="margin-top: 8px; line-height: 1.6; color: #6B7280;">
        This is your verification code
      </p>

      <div style="margin-top: 16px; text-align: center;">
        <p style="display: inline-block; font-size: 32px; font-weight: bold; background-color: #2563EB; color: #ffffff; padding: 12px 24px; border-radius: 12px; letter-spacing: 4px;">
          {otp}
        </p>
      </div>

      <p style="margin-top: 16px; line-height: 1.6; color: #6B7280;">
        This code will only be valid for the next <span style="font-weight: bold;">10 minutes.</span> If the code does not work, you can resend the verification code.
      </p>

      <div style="margin-top: 24px; text-align: center;">
        <a href="#" style="display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 600; background-color: #2563EB; color: white; text-decoration: none; border-radius: 8px;">Resend OTP</a>
      </div>

      <p style="margin-top: 32px; color: #6B7280;">
        Thanks, <br>
        MindSync Team
      </p>
    </main>

    <footer style="margin-top: 32px; text-align: center;">
      <p style="color: #9CA3AF;">© 2025 MindSync. All Rights Reserved.</p>
    </footer>
  </div>
</body>
</html>

        """
    }
    response = requests.post(url, headers=headers, json=payload)
    
    if response.status_code != 200:
        raise Exception(f"Failed to send email: {response.text}")
