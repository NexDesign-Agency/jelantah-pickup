import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-export";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { to } = body;

    if (!to) {
      return NextResponse.json(
        { error: "Email address (to) is required" },
        { status: 400 }
      );
    }

    // Check if SMTP is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json({
        success: false,
        message: "SMTP not configured. Please set SMTP_USER and SMTP_PASS in environment variables.",
      });
    }

    // Send test email
    const testSubject = "Test Email from JelantahGO";
    const testHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Email Test Successful!</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>This is a test email from JelantahGO email notification system.</p>
            <p>If you received this email, your SMTP configuration is working correctly!</p>
            <p><strong>Test Details:</strong></p>
            <ul>
              <li>SMTP Host: ${process.env.SMTP_HOST || "Not set"}</li>
              <li>SMTP Port: ${process.env.SMTP_PORT || "Not set"}</li>
              <li>SMTP User: ${process.env.SMTP_USER ? "✓ Configured" : "✗ Not configured"}</li>
              <li>Sent At: ${new Date().toLocaleString()}</li>
            </ul>
          </div>
          <div class="footer">
            <p>JelantahGO - Your trusted used cooking oil pickup service</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const success = await sendEmail(to, testSubject, testHtml);

    if (success) {
      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${to}`,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: "Failed to send test email. Check server logs for details.",
      });
    }
  } catch (error: any) {
    console.error("Error sending test email:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}

