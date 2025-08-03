# 🧾 Real Estate Check Logging App — PRD (Product Requirements Document)

## 📌 Overview
Build a web-based check logging system for real estate brokerages. The app will receive scanned check images via email, use OpenAI to extract structured data, and log all entries in a searchable database with a friendly frontend interface. Any check with incomplete or uncertain information will be flagged for manual review.

---

## 🎯 Goals
- Automatically log all received checks.
- Extract structured check data via AI.
- Display check details and image in a user-friendly UI.
- Flag incomplete/missing info for staff follow-up.
- Keep hosting and tooling costs as low as possible.

---

## 🧠 Core Workflow
1. A check is emailed to a designated Outlook inbox.
2. Microsoft Power Automate detects the email.
3. Power Automate sends image + metadata to app’s API.
4. Backend:
   - Uploads image to Supabase Storage
   - Sends image to OpenAI for classification
   - Saves structured data to Supabase DB
   - Flags as `parsed` or `needs_review`
5. Frontend displays:
   - All checks received
   - Status (✅ or ⚠️)
   - Image preview
   - Search & filters

---

## 🛠️ Tech Stack
| Function               | Tool                         | Notes                          |
|------------------------|------------------------------|---------------------------------|
| AI Parsing             | OpenAI API (GPT-4o / 3.5)    | ~$0.01 per check               |
| DB + Storage           | Supabase                     | Free tier: DB + image storage  |
| Hosting/API            | Vercel (Next.js)             | Free tier                      |
| Email Intake           | Outlook + Power Automate     | Free tier with MS365           |
| UI Framework           | Next.js + Tailwind + shadcn/ui | Sleek and responsive       |

---

## 🗃️ Database Schema (Supabase)
### Table: `checks`
| Field         | Type        | Description                          |
|---------------|-------------|--------------------------------------|
| id            | UUID        | Primary key                          |
| check_number  | Text        | Number from check                    |
| date          | Date        | Date on check                        |
| amount        | Numeric     | Dollar amount                        |
| memo          | Text        | Text from memo line                  |
| payor         | Text        | Who wrote the check                  |
| payee         | Text        | Who the check is payable to          |
| image_url     | Text        | URL to scanned check image           |
| status        | Enum        | `parsed` / `needs_review`            |
| created_at    | Timestamp   | Auto-generated                       |

---

## 🖥️ Frontend Features
- Admin/staff login (optional in MVP)
- Table view of all checks
  - Thumbnail preview
  - All extracted fields
  - Status indicator ✅/⚠️
  - Click to view/edit
- Filters by:
  - Date
  - Status
  - Payor / Payee
- Manual edit form for fixing incorrect or missing fields

---

## 📬 Email Integration
### Using Outlook + Power Automate
- Trigger: "New email received" to `checks@brokerage.com`
- Actions:
  1. If attachment exists
  2. Extract image(s)
  3. Send HTTP POST to `/api/parse-check`
     - Includes image + email metadata

---

## 🧠 AI Prompt (OpenAI)
The image is sent to OpenAI API using a prompt like:
```json
"You are a document classifier. Extract the following fields from this check image: check_number, date, amount, memo, payor, payee. If a field is not present or not legible, return it as null."
```

---

## 🧪 Validation & Fallbacks
- If 1+ required fields are `null`, save as `needs_review`.
- Show in UI with ⚠️ and priority tag.
- Staff can edit + submit corrected info.

---

## 🔮 Future Features (Post-MVP)
- Match checks to properties/transactions
- Role-based access (agent, admin)
- Export to CSV / QuickBooks
- Dotloop or Skyslope integration
- Bulk uploads
- AI handwriting correction loop

---

## ✅ Next Steps
1. Set up Supabase project (DB + storage bucket)
2. Scaffold Next.js app + Supabase client
3. Build `/api/parse-check` route
4. Create Power Automate flow
5. Design frontend table + detail view

