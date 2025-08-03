# instructions.md — Build Guide for Cursor’s AI Agent (REVISED)

> **Mission:** Implement a low-cost MVP that ingests manually uploaded check scans, extracts fields via OpenAI, stores image + data in a Neon/Turso database, and presents a Next.js dashboard with a review workflow. **Follow steps sequentially. Do not skip ahead.** After each step, **report completion, surface diffs/commands run, and WAIT for the user’s instruction to continue.**

---

## Conventions

- **[Cursor]** = actions you (the AI agent) must perform automatically in the repo or via CLI.
- **[Ask User]** = questions/checkpoints for the user (Antarah) to confirm or provide credentials.
- **[Test]** = how to verify the step works. Include commands, endpoints, expected responses.
- **Git/PR cadence:** GitHub repository: `https://github.com/antarahleet/DepositSync`. Push directly to the `main` branch for this MVP. Commit **early and often**.

---

## Step 0 — Prereqs & Planning

**[Ask User]**

1.  Confirm target stack: **Next.js (App Router) + Vercel**, **Neon/Turso (DB)**, **Vercel Blob (Storage)**, **OpenAI**.
2.  Confirm repository host (GitHub: `https://github.com/antarahleet/DepositSync`).
3.  Confirm we can use TypeScript.

**[Cursor]**

- Create an **append-only** `log.md` in the repo root. After **every** action, append a new entry with timestamp, step, actions taken, technical decisions & reasoning, files changed, and commands run.
- Verify Git is initialized and the remote is set.

**Pause: Wait for user instruction to continue.**

---

## Step 1 — Repo Bootstrap

**[Cursor]**

1.  Initialize Next.js 14+ (App Router, TS).
2.  Add Tailwind CSS.
3.  Install primary dependencies:
    ```bash
    npm i zod @vercel/blob
    npm i -D prisma
    npx prisma init
    ```
4.  Create `app/api/health/route.ts` that returns `{ ok: true }`.
5.  Create a simple homepage with a link to `/checks`.

**[Test]**

- Hit `GET /api/health` → expect `{ ok: true }`.

**Pause: Wait for user instruction to continue.**

---

## Step 2 — Env & Secrets Skeleton

**[Cursor]**

1.  Create `.env.local.example` with:
    ```env
    # Database (Neon or Turso)
    DATABASE_URL=

    # OpenAI
    OPENAI_API_KEY=
    
    # Vercel Blob
    BLOB_READ_WRITE_TOKEN=

    # Webhook secret for future use
    INBOUND_WEBHOOK_SECRET=
    ```
2.  Update `.gitignore` to include `.env.local`.
3.  Create `lib/env.ts` server-only helper to validate env vars.

**[Ask User]**

- Do you have Neon/Turso, OpenAI, and Vercel Blob keys? If **no**, stop and help user create them.

**Pause: Wait for user instruction to continue.**

---

## Step 3 — Database Schema (Prisma)

**[Ask User]**

- Do you have a database connection string (`DATABASE_URL`)? If **no**, guide user to create a project at [Neon](https://neon.tech) or [Turso](https://turso.tech).

**[Cursor]**

1.  Update `prisma/schema.prisma` with the `checks` model:
    ```prisma
    model Check {
      id           String   @id @default(cuid())
      check_number String?
      date         DateTime?
      amount       Float?
      memo         String?
      payor        String?
      payee        String?
      image_url    String
      status       CheckStatus @default(needs_review)
      created_at   DateTime @default(now())
    }

    enum CheckStatus {
      parsed
      needs_review
    }
    ```
2.  Run migration to sync schema with the database:
    ```bash
    npx prisma migrate dev --name init
    ```
3.  Create a Prisma client utility in `lib/db.ts`.

**[Test]**

- Verify `checks` table is created in the database.

**Pause: Wait for user instruction to continue.**

---

## Step 4 — Unified API Route (`/api/checks`)

**[Cursor]**

1.  Create `app/api/checks/route.ts` (POST) to handle `multipart/form-data`.
2.  **Logic:**
    - Accept a `file` from the form data.
    - Upload the file to Vercel Blob using `@vercel/blob`.
    - Get the public URL of the uploaded image.
    - Call an OpenAI Vision model (GPT-4o) with the image URL to extract structured JSON data.
    - Validate the JSON with Zod.
    - Determine `status` (`parsed` or `needs_review`).
    - Save the extracted data and `image_url` to the database using Prisma.
    - Return the newly created record as JSON.

**[Test]**

- Use Postman or a similar tool to send a `multipart/form-data` request with an image file to `POST /api/checks`.
- Expect a 200 response with the created check record.

**Pause: Wait for user instruction to continue.**

---

## Step 5 — Frontend Upload Form

**[Cursor]**

1.  Create `/app/checks/new/page.tsx`.
2.  Build a simple form with a file input (`<input type="file" />`) and a submit button.
3.  On submit, use a Server Action or client-side fetch to send the form data to `POST /api/checks`.
4.  Display a loading state while the check is being processed.
5.  On success, redirect the user to the main checks dashboard (`/checks`).

**[Test]**

- Upload a sample check image.
- Verify the form shows a loading state and then redirects.
- Check the database to confirm a new record was created.

**Pause: Wait for user instruction to continue.**

---

## Step 6 — Checks List & Detail UI

**[Cursor]**

1.  Create `/app/checks/page.tsx` (server component):
    - Fetch the latest 50 checks from the database using Prisma.
    - Render a table showing a thumbnail, amount, date, payor, payee, and status.
    - Each row should link to the detail page (`/checks/[id]`).
2.  Create `/app/checks/[id]/page.tsx`:
    - Fetch the specific check by its ID.
    - Display the full-size image from Vercel Blob and all extracted fields.
3.  Implement an **Edit** form on the detail page to allow manual correction of data. Use a Server Action to update the record in the database.

**[Test]**

- Seed a few records and verify the list renders correctly.
- Click a row and confirm the detail page shows the correct data and image.
- Edit a field and save; verify the data is updated.

**Pause: Wait for user instruction to continue.**

---

## Step 7 — Deployment

**[Cursor]**

1.  Push repo to GitHub.
2.  Create a Vercel project and link it to the GitHub repo.
3.  Set Vercel Environment Variables: `DATABASE_URL`, `OPENAI_API_KEY`, `BLOB_READ_WRITE_TOKEN`, `INBOUND_WEBHOOK_SECRET`.
4.  Deploy `main` branch. Record the production URL.

**[Ask User]**

- Confirm the live URL works and the upload flow is functional.

**Pause: Wait for user instruction to continue.**

---

## Step 8 — Future Features (Post-MVP)

- **Email Integration**: Re-introduce the Outlook + Power Automate flow to hit the same `POST /api/checks` endpoint. The endpoint will need to be updated to handle a `base64` or `fileUrl` payload in addition to `multipart/form-data`.
- **Role-Based Access**: Add user authentication (e.g., NextAuth.js) and RLS.
- **Export to CSV**: Add a button to download check data.
- **Advanced Filtering**: Add more robust search and filtering options to the dashboard.
