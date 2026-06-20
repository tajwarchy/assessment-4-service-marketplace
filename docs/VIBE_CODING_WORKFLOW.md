# Vibe coding workflow

## Approach

I worked with Claude (Anthropic) in a single continuous conversation, structured as
an explicit **phase-by-phase plan** agreed on upfront before any code was written:

1. Project setup & accounts
2. Database schema & ERD
3. Backend auth & RBAC
4. Backend core APIs (services, search, booking, sandbox payment)
5. Backend deployment
6. Frontend foundation (routing, auth context)
7. Frontend role dashboards
8. Checkout flow
9. Frontend deployment
10. Documentation

For each phase, I asked the AI to write the **entire phase in one pass** — every
file, every command, in order — rather than iterating file-by-file. This kept the
session efficient: I'd paste in error output, get a fix, and move forward, instead
of having a back-and-forth design conversation for every small piece.

## Prompting structure

A typical phase request looked like:

> "Next phase" — relying on the AI to remember the full plan and produce the
> complete phase (files, exact terminal commands, and a commit message) without
> re-explaining requirements each time.

When something broke, I pasted the **raw terminal/browser output verbatim**
rather than describing the error in my own words. This consistently got faster,
more accurate fixes than paraphrasing would have, since the AI could read exact
error codes, stack traces, and log lines directly.

## Where the AI succeeded

- **Boilerplate and repetitive structure**: Express routes/controllers/middleware,
  React pages, CRUD endpoints, and the auth/RBAC pattern (`requireAuth` +
  `requireRole`) were generated correctly on the first pass and reused consistently
  across every protected route without me having to repeat the pattern.
- **Schema design**: The Prisma schema and the resulting ERD captured all required
  entity relationships (Users, Vendors, Services, Categories, Bookings, Transactions)
  correctly in one pass, including the design decision to separate `Booking` from
  `Transaction` so a booking can exist independent of payment success/failure.
- **Debugging from raw output**: Several genuinely tricky environment issues were
  diagnosed correctly just from pasted terminal/browser output (see below).

## Where the AI failed or needed manual intervention

This is where most of the actual engineering time went — every issue below was a
real infrastructure/tooling problem, not a business-logic bug, and required reading
logs carefully rather than blindly trusting AI-generated code:

1. **Prisma 7's breaking schema change.** The initial `prisma init` scaffolded a
   project on Prisma 7, which removed `url`/`directUrl` support directly in
   `schema.prisma` in favor of a new `prisma.config.ts` + adapter pattern. The AI's
   first schema (written for the older, more common pattern) failed validation.
   Fix required downgrading to Prisma 5 — a deliberate manual decision to avoid the
   added complexity of the v7 adapter API for a project of this scope. This same
   bug also resurfaced during Render deployment because the downgrade had only been
   applied locally and not committed to `package.json` before pushing — a real
   "forgot to commit the fix" mistake, not a hallucination.
2. **Supabase's IPv6-only direct connection.** `prisma migrate dev` timed out
   connecting to the database's direct connection string. The actual cause (the
   direct connection hostname resolves IPv6-only, and most consumer networks don't
   route IPv6 reliably) required switching `DIRECT_URL` to Supabase's IPv4-compatible
   session pooler endpoint instead.
3. **A misleading Node.js version bug.** The Express server would print
   "Server running on port 5000" and then the process would silently exit with no
   error — even with `uncaughtException`/`unhandledRejection` handlers attached.
   This was eventually isolated (by testing a bare minimal Express server, ruling
   out conda, and checking the Node version) to running on Node **v25**, an
   odd-numbered "Current" release rather than an LTS version. Switching to Node 22
   LTS via `nvm` resolved it completely. This is a good example of the AI correctly
   guiding a systematic debugging process (isolate → test minimal repro → check
   environment) rather than guessing at code-level fixes for what was actually a
   runtime/environment issue.
4. **Port 5000 squatted by macOS.** A separate, unrelated issue masked as "the
   server isn't working" — macOS's AirPlay Receiver (ControlCenter) listens on port
   5000 by default. Diagnosed via `lsof -i :5000`, fixed by switching the app to
   port 5001.
5. **CORS misconfiguration after deployment (twice).** After deploying the frontend
   to Vercel, requests to the Render backend were blocked by CORS because the
   backend's allowed-origins list didn't yet include the live Vercel URL. This
   happened because the exact Vercel URL is only known *after* deployment — a
   deploy-order dependency that's easy to overlook. Fixed by setting `CORS_ORIGIN`
   on Render to match the Vercel domain exactly.

## Takeaway

The AI was highly effective at producing correct, consistent application code
quickly (auth, RBAC, CRUD, schema design, React structure) — but nearly every real
bug encountered during this project came from **tooling/infrastructure version
mismatches and deployment environment differences**, not from the AI generating
incorrect business logic. Diagnosing those required pasting raw error output and
working through the actual stack trace rather than just re-prompting with a vague
"it's not working."