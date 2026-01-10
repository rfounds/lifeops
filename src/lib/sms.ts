import twilio from "twilio";

const client =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

const FROM_PHONE = process.env.TWILIO_PHONE_NUMBER;

type SendSmsParams = {
  to: string;
  message: string;
};

export async function sendSms({ to, message }: SendSmsParams): Promise<boolean> {
  if (!client || !FROM_PHONE) {
    // Fallback to console logging in development
    console.log("=".repeat(60));
    console.log("SMS (console fallback - no TWILIO credentials)");
    console.log("=".repeat(60));
    console.log(`To: ${to}`);
    console.log(`Message: ${message}`);
    console.log("=".repeat(60));
    return true;
  }

  try {
    await client.messages.create({
      body: message,
      from: FROM_PHONE,
      to,
    });
    return true;
  } catch (error) {
    console.error("SMS send error:", error);
    return false;
  }
}

type ReminderSmsParams = {
  to: string;
  tasks: {
    title: string;
    daysUntilDue: number;
  }[];
};

export async function sendReminderSms({
  to,
  tasks,
}: ReminderSmsParams): Promise<boolean> {
  const formatDue = (days: number): string => {
    if (days < 0) return `${Math.abs(days)}d overdue`;
    if (days === 0) return "today";
    if (days === 1) return "tomorrow";
    return `in ${days}d`;
  };

  let message: string;

  if (tasks.length === 1) {
    const task = tasks[0];
    message = `LifeOps: "${task.title}" is due ${formatDue(task.daysUntilDue)}. View: ${process.env.NEXT_PUBLIC_APP_URL || "https://lifeops.app"}/dashboard`;
  } else {
    const taskList = tasks
      .slice(0, 3)
      .map((t) => `- ${t.title} (${formatDue(t.daysUntilDue)})`)
      .join("\n");
    const remaining = tasks.length > 3 ? `\n+${tasks.length - 3} more` : "";
    message = `LifeOps: You have ${tasks.length} tasks:\n${taskList}${remaining}\n\nView: ${process.env.NEXT_PUBLIC_APP_URL || "https://lifeops.app"}/dashboard`;
  }

  return sendSms({ to, message });
}
