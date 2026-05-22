import os
import smtplib

from dotenv import load_dotenv
from email.mime.text import MIMEText

load_dotenv()

EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")

#print("EMAIL_USER =", EMAIL_USER)
#print("EMAIL_PASS =", EMAIL_PASS)


def send_email(to_email: str, subject: str, body: str):

    try:

        msg = MIMEText(body, "html")

        msg["Subject"] = subject
        msg["From"] = EMAIL_USER
        msg["To"] = to_email

        with smtplib.SMTP("smtp.gmail.com", 587) as server:

            server.starttls()

            server.login(
                EMAIL_USER,
                EMAIL_PASS
            )

            server.send_message(msg)

        print("STATUS: 200")
        print("RESPONSE: Email sent successfully")

    except Exception as e:

        print("STATUS: 500")
        print("RESPONSE:", str(e))