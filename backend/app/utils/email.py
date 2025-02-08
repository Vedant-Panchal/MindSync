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
        "html": 
        f"""
        <!doctype html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Welcome to MindSync</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 30px auto; padding: 24px; background-color: #ffffff; border-radius: 10px; box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);">
              <header style="text-align: center;">
                <h1 style="margin: 0; font-size: 40px; font-family: 'Abril Fatface', serif; color: #0f172a; font-weight: 900;">MindSync</h1>
                <p style="margin: 8px 0 0; font-size: 18px; color: #64748b;">Empowering Your Mind, One Step at a Time 🚀</p>
              </header>

              <main style="margin-top: 24px; text-align: center;">
                <p style="margin: 15px 0; font-size: 18px; color: #475569;">Welcome aboard! We're excited to have you as part of our growing community. Please verify your email by using the code below:</p>

                <div style="margin: 24px 0; display: inline-block; padding: 12px 24px; background-color: #1e293b; border-radius: 8px;">
                  <p style="margin: 0; font-size: 32px; font-weight: 800; color: #ffffff; letter-spacing: 8px;">{otp}</p>
                </div>

                <p style="margin: 16px 0; font-size: 16px; color: #475569;">This code is valid for the next <strong>10 minutes</strong>. If it doesn't work, you can request a new one by clicking the button below.</p>

                <a href="https://mindsync.com/resend-code" style="display: inline-block; margin-top: 24px; padding: 12px 24px; background-color: #1e40af; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 700; border-radius: 6px; box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.1);">
                  Resend Code
                </a>
              </main>

              <footer style="margin-top: 32px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 16px;">
                <p style="margin: 0; font-size: 14px; color: #64748b;">Thanks for choosing MindSync! We're here to support you every step of the way. 😊</p>
                <p style="margin: 10px 0 0; font-size: 14px; color: #64748b;">© 2025 MindSync. All rights reserved.</p>
              </footer>
            </div>
          </body>
        </html>

         """
    }
    response = requests.post(url, headers=headers, json=payload)
    
    if response.status_code != 200:
        raise Exception(f"Failed to send email: {response.text}")
