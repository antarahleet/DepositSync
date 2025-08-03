# instructions.md — Build Guide for Cursor’s AI Agent

> **Mission:** Implement a low‑cost MVP that ingests emailed check scans, extracts fields via OpenAI, stores image + data in Supabase, and presents a Next.js dashboard with review workflow. **Follow steps sequentially. Do not skip ahead.** After each step, **report completion, surface diffs/commands run, and WAIT for the user’s instruction to continue.**

---

## Conventions

- **[Cursor]** = actions you (the AI agent) must perform automatically in the repo or via CLI.
- **[Ask User]** = questions/checkpoints for the user (Antarah) to confirm or provide credentials.
- **[Test]** = how to verify the step works. Include commands, endpoints, expected responses, and screenshots to request.
- **Branching:** create feature branches per step (e.g., `feat/step-01-bootstrap`). Open a PR at each step.
- **Security:** Never expose service keys on the client. Server-only env vars must stay in API routes or server components.
- **Logging:** Maintain an append-only `log.md` in the repo root. After **every** action, append a new entry with timestamp, step, actions taken, technical decisions & reasoning, files changed, and commands run. **Never remove or rewrite** previous entries.
- **Git/PR cadence:** GitHub is already connected. Commit **early and often** (atomic commits); push **regularly** to `origin`. Open **one PR per step** (e.g., `feat/step-01-bootstrap`). Include a short description and link to relevant `log.md` entries.

---

## Step 0 — Prereqs & Planning

**[Ask User]**

1. Confirm target stack: **Next.js (App Router) + Vercel**, **Supabase (DB + Storage)**, **OpenAI**, **Outlook + Power Automate**.
2. Confirm repository host (GitHub) and grant access if needed.
3. Confirm we can use TypeScript.
4. Confirm you have created and **opened** the project root folder named `` (or specify another name). Choose the project name accordingly; if `DepositSync` exists, we will use the **current folder** and **will not** create a nested subfolder.

**[Cursor]**

- Record decisions in `docs/decisions.md`.
- Create an **append-only** `log.md` in the repo root. Append a new entry (timestamp, step, brief description, files changed, commands run) after **every** action. **Never** remove or edit past entries.
- Verify Git is initialized and remote is set to GitHub:
  ```bash
  git rev-parse --is-inside-work-tree || git init
  git remote -v || git remote add origin <GITHUB_REPO_URL>
  ```

**[Test]**

- Confirm user responses; do not proceed without them.

**Pause: Wait for user instruction to continue.**

---

## Step 1 — Repo Bootstrap

**[Cursor]**

1. Initialize Next.js 14+ (App Router, TS):
   ```bash
   # Run this **inside** the existing `DepositSync` folder to avoid a nested project
   ```

npx create-next-app\@latest . --ts --eslint

````
2. Add Tailwind CSS:
```bash
npx tailwindcss init -p
````

Configure `tailwind.config.ts` with `content` paths for `app`, `components`. 3. Install deps:

```bash
npm i @supabase/supabase-js zod
npm i -D @types/node
```

4. Create `app/api/health/route.ts` that returns `{ ok: true }`.
5. Add a simple homepage with link to `/checks` (placeholder).
6. Create a feature branch, commit, **push**, and open PR:
   ```bash
   git checkout -b feat/step-01-bootstrap
   git add -A
   git commit -m "chore: bootstrap Next.js app, tailwind, health endpoint"
   git push -u origin feat/step-01-bootstrap
   ```

**[Ask User]**

- Confirm local dev runs: `npm run dev` → open `http://localhost:3000`.

**[Test]**

- Hit `GET /api/health` → expect `{ ok: true }`.

**Pause: Wait for user instruction to continue.**

---

## Step 2 — Env & Secrets Skeleton

**[Cursor]**

1. Create `.env.local.example` with:
   ```env
   # Supabase
   SUPABASE_URL=
   SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=

   # OpenAI
   OPENAI_API_KEY=

   # Webhook secret to authenticate Outlook/PA calls
   INBOUND_WEBHOOK_SECRET=
   ```
2. Add `env.ts` server-only helper to assert presence of required envs in API routes.
3. Document env setup in `docs/env.md`.

**[Ask User]**

- Do you already have Supabase and OpenAI keys? If **no**, stop and help user create them (next step) before proceeding.

**[Test]**

- None yet; proceed after user provides values.

**Pause: Wait for user instruction to continue.**

---

## Step 3 — Supabase Project & Schema

**[Ask User]**

- Do you have a Supabase project? If **no**, guide user to create at [https://app.supabase.com](https://app.supabase.com), then provide:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server-side only)

**[Cursor]**

1. Create SQL migration `supabase/migrations/0001_checks.sql` with:
   ```sql
   create type check_status as enum ('parsed','needs_review');

   create table if not exists checks (
     id uuid primary key default gen_random_uuid(),
     check_number text,
     date date,
     amount numeric,
     memo text,
     payor text,
     payee text,
     image_url text not null,
     status check_status not null default 'needs_review',
     created_at timestamptz not null default now()
   );
   ```
2. Storage: create a bucket named `checks` (private). Document in `docs/storage.md`.
3. (Optional/MVP) RLS:
   - Keep table RLS disabled for now; all writes occur via server using service role.
   - For future auth, add RLS policies.
4. Add a server util `lib/supabaseAdmin.ts` that initializes Supabase with `SERVICE_ROLE` for server-only ops.

**[Test]**

- Run migration via Supabase SQL editor.
- Verify table and type exist.
- Create bucket `checks` and confirm.

**Pause: Wait for user instruction to continue.**

---

## Step 4 — OpenAI Client & Classifier

**[Ask User]**

- Confirm `OPENAI_API_KEY` is available and added to `.env.local`.

**[Cursor]**

1. Add `lib/openai.ts` to create a client using `process.env.OPENAI_API_KEY`.
2. Implement `lib/checkClassifier.ts` exporting `classifyCheck(imageUrl: string)`:
   - Use the OpenAI Responses API (vision) to extract a **strict JSON** object:
     ```ts
     type CheckFields = {
       check_number: string | null;
       date: string | null;        // ISO YYYY-MM-DD
       amount: number | null;      // in USD
       memo: string | null;
       payor: string | null;
       payee: string | null;
       confidence: number;         // 0..1 subjective
       raw_text?: string;          // optional
     }
     ```
   - Use `response_format: { type: 'json_object' }` and a concise system/user prompt instructing nulls when unclear.
3. Validate output with `zod`. Convert `date` to ISO if parseable. Coerce `amount` to number.

**[Test]**

- Add `scripts/dev-classify.ts` CLI that calls `classifyCheck` on a sample image URL and logs output.
- Run and capture JSON output.

**Pause: Wait for user instruction to continue.**

---

## Step 5 — Upload-to-Storage Helper

**[Cursor]**

1. Implement `lib/uploadToStorage.ts`:
   - Inputs: `{ base64?: string; fileUrl?: string; filename: string }`.
   - If `base64`, decode and upload to `checks/<yyyy>/<mm>/<uuid>_<filename>`.
   - If `fileUrl`, fetch and stream upload.
   - Return `{ path, publicUrlOrSignedUrl }` (for private bucket, generate a **signed URL** valid \~1 year; document expiry strategy).
2. Use `supabaseAdmin.storage.from('checks')` with service role.

**[Test]**

- Add `scripts/dev-upload.ts` to upload a tiny sample image (base64) and print the signed URL.

**Pause: Wait for user instruction to continue.**

---

## Step 6 — Parse Endpoint (Webhook)

**[Cursor]**

1. Create `app/api/parse-check/route.ts` (POST):
   - **Auth:** Require header `X-Webhook-Secret: ${INBOUND_WEBHOOK_SECRET}`; return 401 if missing/invalid.
   - Accept JSON payload:
     ```ts
     type InboundPayload = {
       filename: string;
       fileData?: string;   // base64-encoded image
       fileUrl?: string;    // optional URL from upstream
       emailFrom?: string;
       emailSubject?: string;
     }
     ```
   - Validate payload with zod; require either `fileData` or `fileUrl`.
   - Upload image to storage ⇒ get image URL (signed if private).
   - Call `classifyCheck(imageUrl)`.
   - Decide `status`: `parsed` if `check_number`, `date`, `amount`, `payor`, `payee` are non-null; else `needs_review`.
   - Insert into `checks` table and return saved row JSON.
   - Limit body size (e.g., 10MB) and handle large file errors.
2. Add error logging and friendly error messages.

**[Test]**

- Local cURL test:
  ```bash
  curl -X POST http://localhost:3000/api/parse-check \
    -H "Content-Type: application/json" \
    -H "X-Webhook-Secret: $INBOUND_WEBHOOK_SECRET" \
    -d '{"filename":"test.png","fileUrl":"https://.../sample.png"}'
  ```
- Expect 200 with inserted record.

**Pause: Wait for user instruction to continue.**

---

## Step 7 — Checks List UI

**[Cursor]**

1. Install UI deps: `npm i clsx lucide-react` and set up **shadcn/ui** (optional if already configured).
2. Create `/app/checks/page.tsx` (server component):
   - Server-side fetch of the latest 50 checks (ordered by `created_at desc`).
   - Render table: thumbnail, amount, date, payor, payee, memo, status pill, and link to detail page.
   - Add filters (status, date range) and search (payor/payee) — can be server query params.
3. Generate thumbnail using the stored URL directly (no client secrets).

**[Test]**

- Seed a few records (manual inserts or via endpoint) and verify list renders.

**Pause: Wait for user instruction to continue.**

---

## Step 8 — Detail View & Edit Flow

**[Cursor]**

1. Create `/app/checks/[id]/page.tsx`:
   - Show full-size image (fit within container), all parsed fields, created\_at, and status.
   - Provide an **Edit** form (server action or client form + API) to update fields and change status.
2. Create `app/api/checks/[id]/route.ts` (PATCH): updates allowed columns; validate with zod; return updated row.
3. On save, default status to `parsed` unless fields remain missing.

**[Test]**

- Edit a `needs_review` row to fix missing fields → save → verify status updates in DB and list view.

**Pause: Wait for user instruction to continue.**

---

## Step 9 — Outlook → Power Automate Flow

**[Ask User]**

- Confirm access to Microsoft 365 admin and Power Automate with permissions to create a flow on `checks@brokerage.com` inbox.

**[Cursor]** (document in `docs/power-automate.md`)

1. Create a new **Automated cloud flow**:
   - **Trigger:** *When a new email arrives (V3)*
     - Folder: Inbox (or a specific subfolder)
     - Advanced options: Only with attachments = true
   - **Condition:** attachment content type contains `image/` or filename ends with `.png|.jpg|.jpeg|.pdf` (PDF optional)
   - **Apply to each attachment:**
     - **Compose** → base64 of `Attachment Content` (if not already base64)
     - **HTTP** action (POST):
       - URL: `<DEPLOYED_URL>/api/parse-check`
       - Headers: `Content-Type: application/json`, `X-Webhook-Secret: <INBOUND_WEBHOOK_SECRET>`
       - Body JSON:
         ```json
         {
           "filename": "@{items('Current_Attachment')?['Name']}",
           "fileData": "@{base64(body('Get_attachment_content'))}",
           "emailFrom": "@{triggerOutputs()?['headers']?['From']}",
           "emailSubject": "@{triggerBody()?['Subject']}"
         }
         ```
2. Save and test by emailing a check image to the inbox.

**[Test]**

- Verify flow run success, 200 from webhook, and new row visible on `/checks`.

**Pause: Wait for user instruction to continue.**

---

## Step 10 — Deployment

**[Cursor]**

1. Push repo to GitHub; create Vercel project and link.
2. Set Vercel Environment Variables: `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `INBOUND_WEBHOOK_SECRET`.
3. Add `VERCEL_URL` handling if needed for absolute URLs.
4. Deploy main branch. Record production URL in `docs/urls.md`.

**[Ask User]**

- Confirm live URL works and approve switching Power Automate endpoint to production.

**[Test]**

- Repeat the cURL test against production URL. Then run a real email through Power Automate.

**Pause: Wait for user instruction to continue.**

---

## Step 11 — Quality, Logging & Guardrails

**[Cursor]**

1. Add basic request logging (without sensitive payloads).
2. Add error boundaries on UI pages.
3. Add file size/type checks on `/api/parse-check` (reject > 10MB, non-image unless PDF support added).
4. Add rate limiting (IP or header-based) to the webhook.
5. Add `Export CSV` button on `/checks` that calls a server action to generate and download CSV of current filter.

**[Test]**

- Simulate failures (invalid secret, huge file) and confirm safe errors.
- Export CSV and validate columns.

**Pause: Wait for user instruction to continue.**

---

## Step 12 — Optional Enhancements (Queued)

- Auth (Supabase Auth) + RLS policies for per-user access.
- PDF support via lightweight OCR (e.g., image extraction from PDF pages) before OpenAI call.
- Match checks to transactions/deals (add `deal_id` FK later).
- Notifications: send email/Slack on `needs_review` entries.
- Scheduled signed URL refresh worker.

**[Ask User]**

- Which enhancements should be prioritized next?

**Pause: Wait for user instruction to continue.**

---

## Appendix — Prompts & Validation

**OpenAI Prompt Skeleton** (used in `classifyCheck`):

```
System: You are a precise document extraction assistant. Return only JSON.
User: Extract fields from this bank check image. If a field is unclear or absent, set it to null. Fields: check_number, date (YYYY-MM-DD), amount (number), memo, payor, payee, confidence (0..1), raw_text (optional). Image: <{imageUrl}>. Return only a JSON object.
```

**Validation Rules**

- `check_number`: trim non-alphanumerics; allow null.
- `date`: parse common formats; convert to `YYYY-MM-DD`; else null.
- `amount`: extract digits/decimal; to number; else null.
- `memo/payor/payee`: trim whitespace; null if empty.
- `confidence`: 0..1; default 0.5 if absent.

**Status Logic**

- `parsed` ⇢ all of: check\_number, date, amount, payor, payee are non-null.
- otherwise `needs_review`.

---

## Final Rule

**Do not proceed past any step until the user reviews and explicitly says to continue.** Provide a concise summary, surface diffs, and ask for approval at every checkpoint.

