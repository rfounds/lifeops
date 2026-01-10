# LifeOps

A calm "life admin" app for tracking low-frequency, high-importance tasks. Insurance renewals, annual checkups, tax deadlines, and more.

## Features

- **Task Management**: Create, edit, complete, and delete tasks with different schedule types
- **Smart Scheduling**: Support for fixed dates, recurring (every N months), and yearly tasks
- **Auto-Reschedule**: Completing a task automatically calculates the next due date
- **Email Reminders**: Get notified at 7 days, 1 day, and on due date
- **Dashboard**: See overdue, due soon, and upcoming tasks at a glance
- **Templates**: Pre-built checklists for common life admin tasks (Pro)
- **Free/Pro Tiers**: Free tier (5 tasks), Pro tier (unlimited + templates)

## Tech Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- Auth.js (NextAuth v5)
- Resend for email
- Stripe for subscriptions

## Getting Started

### Prerequisites

- Node.js 18+
- Docker (for PostgreSQL)
- npm

### 1. Clone and Install

```bash
cd lifeops
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Database (default works with Docker Compose)
DATABASE_URL="postgresql://lifeops:lifeops_dev@localhost:5432/lifeops"

# Auth.js - generate with: openssl rand -base64 32
AUTH_SECRET="your-secret-here"
AUTH_URL="http://localhost:3000"

# Email (optional - falls back to console logging)
RESEND_API_KEY=""

# Cron job protection
CRON_SECRET="your-cron-secret"

# Stripe (optional - use dev mode buttons without)
STRIPE_SECRET_KEY=""
STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""
STRIPE_PRO_PRICE_ID=""
```

### 3. Start PostgreSQL

```bash
docker-compose up -d
```

### 4. Set Up Database

```bash
npm run db:push
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

### Creating an Account

1. Go to `/register`
2. Enter your name, email, and password
3. You'll be redirected to the dashboard

### Adding Tasks

1. Click "Add Task" on the dashboard
2. Fill in:
   - **Title**: What needs to be done
   - **Category**: Finance, Legal, Home, Health, Digital, or Other
   - **Schedule Type**:
     - Fixed Date: One-time task
     - Every N Months: Recurring task
     - Yearly: Same date each year
   - **Due Date**: When it's due (or first occurrence)
   - **Notes**: Optional details

### Completing Tasks

Click "Complete" on a task. For recurring tasks, the next due date is automatically calculated.

### Using Templates (Pro)

1. Upgrade to Pro (use dev button in development mode)
2. Go to Templates page
3. Click "Add to My Tasks" on a template

## Testing Email Reminders

The cron endpoint sends reminders for tasks due in 7 days, 1 day, today, or overdue.

```bash
# Test the cron endpoint
curl -X POST http://localhost:3000/api/cron/send-reminders \
  -H "x-cron-secret: dev-cron-secret"
```

Without `RESEND_API_KEY`, emails are logged to the console.

## Development

### Database Commands

```bash
npm run db:push      # Push schema changes
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio
npm run db:generate  # Generate Prisma client
```

### Dev Mode Features

In development (`NODE_ENV=development`):
- Use "Dev: Upgrade to Pro" button on pricing page
- Email reminders are logged to console

## Deployment

### Vercel

1. Connect your repo to Vercel
2. Add environment variables
3. Deploy

### Cron Jobs

Set up a cron job to call the reminders endpoint daily:

```bash
# Example: Run daily at 9 AM
0 9 * * * curl -X POST https://your-domain.com/api/cron/send-reminders -H "x-cron-secret: YOUR_SECRET"
```

For Vercel, use [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs):

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/send-reminders",
      "schedule": "0 9 * * *"
    }
  ]
}
```

### Stripe Setup

1. Create a Stripe account
2. Create a product with a recurring price
3. Set up webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
4. Add webhook events: `checkout.session.completed`, `customer.subscription.deleted`, `customer.subscription.updated`
5. Add environment variables

## Project Structure

```
lifeops/
├── prisma/
│   └── schema.prisma      # Database schema
├── src/
│   ├── actions/           # Server actions
│   │   ├── auth.ts        # Login/register
│   │   ├── tasks.ts       # Task CRUD
│   │   ├── templates.ts   # Template data & actions
│   │   └── billing.ts     # Stripe checkout
│   ├── app/
│   │   ├── (auth)/        # Login/register pages
│   │   ├── (dashboard)/   # Protected pages
│   │   ├── api/           # API routes
│   │   └── pricing/       # Public pricing page
│   ├── components/        # React components
│   └── lib/               # Utilities
│       ├── auth.ts        # Auth.js config
│       ├── db.ts          # Prisma client
│       ├── email.ts       # Email sending
│       └── schedule-utils.ts # Date calculations
├── docker-compose.yml     # PostgreSQL setup
└── .env.example           # Environment template
```

## License

MIT
