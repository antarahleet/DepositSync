# DepositSync

A real estate check logging system built with Next.js, Neon PostgreSQL, and Vercel Blob.

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Database**: Neon (PostgreSQL)
- **Storage**: Vercel Blob
- **AI**: OpenAI API (GPT-4o) for check data extraction
- **Deployment**: Vercel

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/antarahleet/DepositSync.git
   cd DepositSync
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   Then edit `.env.local` with your actual values:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `BLOB_READ_WRITE_TOKEN`: Your Vercel Blob token

4. **Set up the database**
   ```bash
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Development

- **API Routes**: `/api/checks` - Handles check uploads and processing
- **Pages**: 
  - `/checks/new` - Upload new checks
  - `/checks` - View all checks
  - `/checks/[id]` - View/edit individual checks

## Deployment

The app is configured for deployment on Vercel. Simply connect your GitHub repository to Vercel for automatic deployments.

## Architecture

- **Manual Upload**: Users upload check images through a web interface
- **AI Processing**: OpenAI Vision extracts structured data from check images
- **Database Storage**: Check data and metadata stored in Neon PostgreSQL
- **Image Storage**: Check images stored in Vercel Blob
- **Future**: Email integration planned for automated processing 