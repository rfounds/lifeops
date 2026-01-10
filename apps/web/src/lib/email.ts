import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  if (!resend) {
    // Fallback to console logging in development
    console.log("=".repeat(60));
    console.log("EMAIL (console fallback - no RESEND_API_KEY)");
    console.log("=".repeat(60));
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log("-".repeat(60));
    console.log(html.replace(/<[^>]*>/g, "")); // Strip HTML for readability
    console.log("=".repeat(60));
    return true;
  }

  try {
    const { error } = await resend.emails.send({
      from: "LifeOps <notifications@yourdomain.com>", // Update with your domain
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Email send error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Email error:", error);
    return false;
  }
}

type ReminderEmailParams = {
  to: string;
  userName: string;
  tasks: {
    title: string;
    category: string;
    dueDate: Date;
    daysUntilDue: number;
  }[];
};

export async function sendReminderEmail({
  to,
  userName,
  tasks,
}: ReminderEmailParams): Promise<boolean> {
  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  const taskRows = tasks
    .map((task) => {
      let urgency = "";
      if (task.daysUntilDue < 0) {
        urgency = `<span style="color: #dc2626; font-weight: bold;">Overdue by ${Math.abs(task.daysUntilDue)} day${Math.abs(task.daysUntilDue) === 1 ? "" : "s"}</span>`;
      } else if (task.daysUntilDue === 0) {
        urgency = `<span style="color: #dc2626; font-weight: bold;">Due today</span>`;
      } else if (task.daysUntilDue === 1) {
        urgency = `<span style="color: #f59e0b; font-weight: bold;">Due tomorrow</span>`;
      } else {
        urgency = `<span style="color: #8b5cf6;">Due in ${task.daysUntilDue} days</span>`;
      }

      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            <strong>${task.title}</strong><br>
            <small style="color: #6b7280;">${task.category}</small>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            ${formatDate(task.dueDate)}<br>
            ${urgency}
          </td>
        </tr>
      `;
    })
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; margin: 0; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">LifeOps</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Task Reminder</p>
        </div>

        <!-- Content -->
        <div style="padding: 32px;">
          <p style="color: #374151; font-size: 16px; margin: 0 0 24px 0;">
            Hi ${userName || "there"}, you have tasks that need attention:
          </p>

          <table style="width: 100%; border-collapse: collapse; background: #f9fafb; border-radius: 8px; overflow: hidden;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Task</th>
                <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Due Date</th>
              </tr>
            </thead>
            <tbody>
              ${taskRows}
            </tbody>
          </table>

          <div style="text-align: center; margin-top: 32px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL}/dashboard"
               style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
              View Dashboard
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            You're receiving this because you enabled email reminders.
            <br/>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL}/settings" style="color: #8b5cf6;">Manage preferences</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `LifeOps: ${tasks.length} task${tasks.length === 1 ? "" : "s"} need${tasks.length === 1 ? "s" : ""} attention`,
    html,
  });
}
