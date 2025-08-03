# 🧾 DepositSync

Automated check processing and logging system for real estate brokerages.

## Features

- 📧 **Email Processing**: Automatically receives check images via email
- 🤖 **AI Extraction**: Uses OpenAI to extract check details with high accuracy
- 📊 **Dashboard**: Searchable interface to review and manage processed checks
- 🔒 **Secure**: Server-side processing with webhook authentication

## Tech Stack

- **Frontend**: Next.js 14+ (App Router) with TypeScript
- **Database**: Neon (PostgreSQL) or Turso (SQLite)
- **Storage**: Vercel Blob
- **AI Processing**: OpenAI API
- **Hosting**: Vercel
- **Styling**: Tailwind CSS

## Quick Start

### Prerequisites

- Node.js 18+
- Neon or Turso database account
- OpenAI API key
- Vercel account (for Blob storage)

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
    - `DATABASE_URL`: Your Neon or Turso database connection string
    - `OPENAI_API_KEY`: Your OpenAI API key
    - `BLOB_READ_WRITE_TOKEN`: Your Vercel Blob token
    - `INBOUND_WEBHOOK_SECRET`: A secret for future webhook authentication

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

- **Health Check**: `GET /api/health` - Returns `{ ok: true, timestamp: "..." }`
- **Upload Check**: `/checks/new` - Upload and process check images
- **Checks Dashboard**: `/checks` - View all processed checks
- **Check Details**: `/checks/[id]` - View and edit individual checks

## Deployment

This project is designed to be deployed on Vercel. Set up the environment variables in your Vercel project settings.

## License

MIT 