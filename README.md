# 🧾 DepositSync

Automated check processing and logging system for real estate brokerages.

## Features

- 📧 **Email Processing**: Automatically receives check images via email
- 🤖 **AI Extraction**: Uses OpenAI to extract check details with high accuracy
- 📊 **Dashboard**: Searchable interface to review and manage processed checks
- 🔒 **Secure**: Server-side processing with webhook authentication

## Tech Stack

- **Frontend**: Next.js 14+ (App Router) with TypeScript
- **Database & Storage**: Supabase (PostgreSQL + Storage)
- **AI Processing**: OpenAI API
- **Email Integration**: Outlook + Microsoft Power Automate
- **Hosting**: Vercel
- **Styling**: Tailwind CSS

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase account
- OpenAI API key
- Microsoft 365 account (for Power Automate)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/antarahleet/DepositSync.git
   cd DepositSync
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in your environment variables in `.env.local`:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `INBOUND_WEBHOOK_SECRET`: A secret for webhook authentication

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

- **Health Check**: `GET /api/health` - Returns `{ ok: true, timestamp: "..." }`
- **Checks Dashboard**: `/checks` - View all processed checks (coming soon)

## Deployment

This project is designed to be deployed on Vercel. Set up the environment variables in your Vercel project settings.

## License

MIT 