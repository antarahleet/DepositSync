# 🧾 Real Estate Check Logging App — PRD (Product Requirements Document)

## 📌 Overview
Build a web-based check logging system for real estate brokerages. The app will receive manually uploaded check images, use OpenAI to extract structured data, and log all entries in a searchable database with a friendly frontend interface. Any check with incomplete or uncertain information will be flagged for manual review. **Future: Email-based ingestion will be added using the same backend infrastructure.**

---

## 🎯 Goals
- Manually upload and automatically log all received checks.
- Extract structured check data via AI.
- Display check details and image in a user-friendly UI.
- Flag incomplete/missing info for staff follow-up.
- Keep hosting and tooling costs as low as possible.
- **Future: Automate via email ingestion.**

---

## 🧠 Core Workflow
1. User manually uploads a check image via the web interface (`/checks/new`).
2. Backend processes the uploaded image:
   - Uploads image to Vercel Blob storage
   - Sends image to OpenAI for data extraction
   - Saves structured data to Neon PostgreSQL database
   - Flags as `parsed` or `needs_review`
3. Frontend displays:
   - All checks received
   - Status (✅ or ⚠️)
   - Image preview
   - Search & filters

**Future Workflow:**
1. Check emailed to designated Outlook inbox
2. Microsoft Power Automate detects the email
3. Power Automate sends image + metadata to same `/api/checks` endpoint
4. Same backend processing as manual upload

---

## 🛠️ Tech Stack
| Function               | Tool                         | Notes                          |
|------------------------|------------------------------|---------------------------------|
| AI Parsing             | OpenAI API (GPT-4o Vision)   | ~$0.01 per check               |
| Database               | Neon (PostgreSQL)            | Free tier with excellent Prisma support |
| Image Storage          | Vercel Blob                  | Free tier, seamless Vercel integration |
| Hosting/API            | Vercel (Next.js)             | Free tier                      |
| UI Framework           | Next.js + Tailwind CSS       | Modern, responsive design      |

---

## 🗃️ Database Schema (Neon PostgreSQL)
### Table: `checks`
| Field         | Type        | Description                          |
|---------------|-------------|--------------------------------------|
| id            | String      | Primary key (CUID)                   |
| checkNumber   | String?     | Number from check                    |
| date          | DateTime?   | Date on check                        |
| amount        | Float?      | Dollar amount                        |
| memo          | String?     | Text from memo line                  |
| payor         | String?     | Who wrote the check                  |
| payee         | String?     | Who the check is payable to          |
| imageUrl      | String      | URL to scanned check image           |
| status        | Enum        | `parsed` / `needs_review`            |
| createdAt     | DateTime    | Auto-generated                       |

---

## 🖥️ Frontend Features
- Manual upload interface (`/checks/new`)
- Table view of all checks (`/checks`)
  - Thumbnail preview
  - All extracted fields
  - Status indicator ✅/⚠️
  - Click to view/edit
- Individual check detail pages (`/checks/[id]`)
  - Full image display
  - Editable form for corrections
- Filters by:
  - Date
  - Status
  - Payor / Payee

---

## 📤 Upload Integration
### Manual Upload Flow (Current MVP)
- User navigates to `/checks/new`
- Drag-and-drop or file picker interface
- Form submits to `POST /api/checks`
- Real-time processing feedback
- Redirect to dashboard on completion

### Email Integration Flow (Future)
- Trigger: "New email received" to `checks@brokerage.com`
- Actions:
  1. If attachment exists
  2. Extract image(s)
  3. Send HTTP POST to same `/api/checks` endpoint
     - Includes image + email metadata

---

## 🧠 AI Prompt (OpenAI)
The image is sent to OpenAI API using a prompt like:
```json
"You are a document classifier. Extract the following fields from this check image: checkNumber, date, amount, memo, payor, payee. If a field is not present or not legible, return it as null."
```

---

## 🧪 Validation & Fallbacks
- If 1+ required fields are `null`, save as `needs_review`.
- Show in UI with ⚠️ and priority tag.
- Staff can edit + submit corrected info.

---

## 🔮 Future Features (Post-MVP)
- **Email Integration**: Outlook + Power Automate webhook to same `/api/checks` endpoint
- **Authentication**: Minimal email magic link auth (JWT or token-based)
- **Role-based access** (agent, admin)
- **Export to CSV** / QuickBooks
- **Dotloop or Skyslope integration**
- **Bulk uploads**
- **AI handwriting correction loop**

---

## ✅ Next Steps
1. ✅ Set up Neon PostgreSQL database
2. ✅ Scaffold Next.js app + Prisma client
3. ✅ Build `/api/checks` route
4. ✅ Create manual upload interface
5. ✅ Design frontend table + detail view
6. ✅ Deploy to Vercel
7. 🔄 **Future**: Implement email integration via Power Automate

