# State management & route protection

## Backend: route protection

Every protected route uses two composable Express middlewares, applied in order:

```js
router.post('/services', requireAuth, requireRole('VENDOR'), createService);
```

- **`requireAuth`** — reads the `Authorization: Bearer <token>` header, verifies the
  JWT signature with `JWT_SECRET`, and attaches the decoded payload (`{ id, role,
  email }`) to `req.user`. Returns `401` if the token is missing, malformed, or
  invalid/expired.
- **`requireRole(...roles)`** — checks `req.user.role` against an allowlist of roles.
  Returns `403` if the authenticated user's role isn't permitted. Must run *after*
  `requireAuth`, since it depends on `req.user` already being set.

This pattern is reused identically across every controller (auth, services,
bookings, admin) so RBAC logic lives in exactly one place rather than being
re-implemented per-route.

**Ownership checks** (e.g. a vendor editing *their own* service, not someone else's)
are handled inside the controller itself, after role-checking — `requireRole`
confirms the user *is* a vendor; the controller then confirms they own the specific
resource being modified (`service.vendorId !== vendor.id` → `403`).

## Frontend: state management

- **Auth state** lives in a single React Context (`AuthContext`), not Redux or any
  external state library — the app's global state surface is small enough (just
  the logged-in user) that Context + `useState` is sufficient and avoids
  unnecessary dependencies.
- The JWT and a cached copy of the user object are stored in `localStorage` so a
  page refresh doesn't immediately log the user out. On mount, `AuthContext`
  re-validates the stored token by calling `GET /api/auth/me` — if the token has
  expired or is invalid, the session is cleared and the user is treated as logged
  out, rather than trusting stale `localStorage` data indefinitely.
- An axios response interceptor in `api/client.js` watches for `401` responses
  globally and clears local session state automatically — so an expired token
  doesn't leave the UI in an inconsistent "looks logged in but every request fails"
  state.

## Frontend: route protection

`ProtectedRoute` wraps any route that requires authentication and/or a specific role:

```jsx
<Route
  path="/vendor/dashboard"
  element={
    <ProtectedRoute roles={['VENDOR']}>
      <VendorDashboard />
    </ProtectedRoute>
  }
/>
```

- While the auth check is loading (on initial page load), it shows a loading state
  rather than flashing a redirect.
- If there's no logged-in user, it redirects to `/login`.
- If the user is logged in but their role isn't in the allowed list, it redirects
  to the marketplace home page rather than showing a broken/empty dashboard.

This mirrors the backend's two-step pattern (authenticate, then authorize) but
implemented as a single wrapper component for simplicity, since the frontend only
needs to gate *page visibility* — the backend remains the actual source of truth
for authorization on every API call.