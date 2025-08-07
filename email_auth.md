# email-auth.md — Local Email+Password Auth System

> **Purpose:** Implement a secure, self-hosted authentication system using email + password (no Clerk, Supabase Auth, or magic links). Includes user signup, login, logout, forgot/reset password, and session-based access control.

---

## Step 0 — Schema and Setup

**[Cursor]**

1. Create a `users` table in Neon PostgreSQL:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

2. Create a `password_reset_tokens` table:
```sql
CREATE TABLE password_reset_tokens (
  token TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE
);
```

3. Install bcryptjs for hashing passwords:
```bash
npm i bcryptjs
```

4. Create `lib/hash.ts`:
```ts
import bcrypt from 'bcryptjs';

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}
```

5. Add utility for generating secure tokens:
```ts
import crypto from 'crypto';

export function generateToken(length = 48): string {
  return crypto.randomBytes(length).toString('hex');
}
```

**[Ask User]**
- Confirm Neon database connection and table creation.

**[Test]**
- Manually insert a test user with a hashed password and query.

---

## Step 1 — Signup & Login Routes

**[Cursor]**

1. Create:
```
/app/api/auth/signup/route.ts
/app/api/auth/login/route.ts
/app/api/auth/logout/route.ts
```

2. **Signup Route**
```ts
POST /api/auth/signup
Body: { email, password, name? }
- Hash password
- Check for existing user
- Insert new user
- Return 201 or error
```

3. **Login Route**
```ts
POST /api/auth/login
Body: { email, password }
- Fetch user
- Verify password
- If OK, set HttpOnly session cookie
- Return 200 or error
```

4. **Logout Route**
```ts
POST /api/auth/logout
- Clear session cookie
```

5. Use `cookies()` API from Next.js App Router for setting/clearing cookies.

**[Ask User]**
- Do you want to use JWTs or session IDs? (Recommend session IDs for easier revocation)

**[Test]**
- Test with Postman or frontend login form.

---

## Step 2 — Middleware for Auth Guard

**[Cursor]**

1. Create `middleware.ts` or `lib/authMiddleware.ts`:
```ts
import { cookies } from 'next/headers';

export function getUserFromSession() {
  const cookie = cookies().get('session')?.value;
  // Decode session cookie or look up in DB
  return cookie ? JSON.parse(atob(cookie)) : null;
}
```

2. Use this in layout or server routes to protect pages.

---

## Step 3 — Forgot/Reset Password

**[Cursor]**

1. Install Resend for free email sending:
```bash
npm i resend
```

2. Add Resend API key to environment variables:
```env
RESEND_API_KEY=your_resend_api_key
```

3. Add `/api/auth/forgot-password`:
```ts
POST /api/auth/forgot-password
Body: { email }
- Generate token
- Store with user ID, 15min expiry
- Send email with reset link via Resend
```

4. Add `/api/auth/reset-password`:
```ts
POST /api/auth/reset-password
Body: { token, newPassword }
- Validate token
- If valid and unused, hash new password and update user
- Mark token as used
```

**[Ask User]**
- Set up free Resend account and get API key.

**[Test]**
- Visit `/forgot-password`, trigger flow, receive email, update password.

---

## Step 4 — Frontend Pages

**[Cursor]**

Create the following pages:
```
/app/login/page.tsx
/app/signup/page.tsx
/app/forgot-password/page.tsx
/app/reset-password/page.tsx
```

Each should:
- Use `useForm` or simple form handlers
- POST to the corresponding API route
- On success, redirect or show confirmation

Bonus:
- Keep login state via cookie read (e.g. in layout or navbar)

**[Test]**
- Walk through full flow: signup → login → dashboard → logout → forgot/reset.

---

## Step 5 — Admin/Staff Roles (Optional)

**[Cursor]**

1. Add `role` column to `users` table:
```sql
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'staff';
```

2. Modify session logic to include user role.
3. Protect `/checks` routes unless `user.role === 'admin'` or `staff`.

**[Test]**
- Log in with different roles and validate route access.

---

## Final Notes

- Do not proceed past any step without user confirmation.
- Add each change to `log.md`.
- Commit and push to GitHub regularly.
- Once this system is working, remove reliance on any external auth (Clerk, Supabase Auth, etc.).

---

Let me know if you'd like me to add this to your **future-checklist.md** or integrate it directly into `instructions.md`. Ready when you are! 