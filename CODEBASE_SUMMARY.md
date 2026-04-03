# KaoTorPai Mobile App — Codebase Summary
Generated: 2026-04-03

---

## 1. Project Structure

```
mobileApp/
├── app/                          ← Expo Router file-based screens (every .js = a route)
│   ├── _layout.js                ← Root layout: Stack navigator + providers (43 lines)
│   ├── login.js                  ← Login + register (email & Google OAuth) (296 lines)
│   ├── (tabs)/                   ← Bottom tab group (5 tabs)
│   │   ├── _layout.js            ← Tab bar config: icons, FAB button, theming (115 lines)
│   │   ├── index.js              ← Home: public event list with pagination (182 lines)
│   │   ├── run.js                ← My Runs: registration list + progress (277 lines)
│   │   ├── submit.js             ← Submit proof: image + distance + duration (392 lines)
│   │   ├── rank.js               ← Delivery tracking: 4-step timeline (255 lines)
│   │   └── profile.js            ← Profile: stats, completed events, menu (221 lines)
│   ├── event/
│   │   ├── [id].js               ← Event detail: info, packages, smart CTA (284 lines)
│   │   ├── select-package.js     ← Package + variant selection → add to cart (297 lines)
│   │   ├── register.js           ← Registration form: address + geography cascade (468 lines)
│   │   └── payment.js            ← PromptPay QR + slip upload + status views (317 lines)
│   ├── run/
│   │   └── [id].js               ← Registration detail: progress, results, actions (246 lines)
│   ├── profile/
│   │   ├── edit.js               ← Edit profile + shipping address (302 lines)
│   │   ├── settings.js           ← Settings menu + logout (90 lines)
│   │   ├── history.js            ← Run history: sortable, filterable (240 lines)
│   │   └── completed.js          ← Completed events grid view (137 lines)
│   ├── (common)/
│   │   ├── cart.js               ← Shopping cart (AsyncStorage-backed) (165 lines)
│   │   ├── checkout.js           ← Checkout flow
│   │   ├── notifications.js      ← Notification center
│   │   └── search.js             ← Event search
│   └── shipment/
│       └── [id].js               ← Shipment detail view
├── components/                   ← Shared UI components (8 files)
│   ├── FormInput.js              ← Themed text input with label (48 lines)
│   ├── Logo.js                   ← App logo in 3 sizes (60 lines)
│   ├── LoginPrompt.js            ← Unauthenticated placeholder UI (35 lines)
│   ├── TopNavigation.js          ← Tab screen header: logo, search, cart, notif (158 lines)
│   ├── TopNavigationBack.js      ← Detail screen header: back + title (71 lines)
│   ├── Skeleton.js               ← Pulsing loading placeholders (74 lines)
│   └── ShipmentProgress.js       ← Shipment progress component
├── constants/
│   └── GlobalStyles.js           ← Design system: colors, typography, layout, theme (363 lines)
├── contexts/
│   └── AuthContext.js            ← Firebase + backend auth state (202 lines)
├── hooks/
│   └── useAuthGuard.js           ← Two auth hooks: guard (redirect) + check (42 lines)
├── utils/
│   ├── api.js                    ← Axios instance with auth interceptor (43 lines)
│   ├── firebase.js               ← Firebase initialization + auth exports (43 lines)
│   ├── storage.js                ← AsyncStorage helpers for token + user data (48 lines)
│   └── services/                 ← API service functions (one file per domain)
│       ├── authService.js        ← Login + register with backend (27 lines)
│       ├── eventService.js       ← Public events, event detail, packages (54 lines)
│       ├── registrationService.js← CRUD for user registrations (52 lines)
│       ├── runningProofService.js ← Upload proof image + create proof/result (57 lines)
│       ├── paymentService.js     ← QR code, slip upload, submit slip (40 lines)
│       ├── shipmentService.js    ← Shipment lookup + confirm delivery (30 lines)
│       ├── userService.js        ← Get and update user profile (20 lines)
│       ├── geographyService.js   ← Province/district/sub-district cascade (30 lines)
│       └── notificationService.js← Notifications CRUD (38 lines)
├── scripts/
│   └── generate-assets.js        ← Node script to generate icon/splash PNGs via sharp
├── assets/                       ← icon.png, adaptive-icon.png, splash.png, logo.png
├── app.json                      ← Expo config: name, scheme, EAS project ID
├── eas.json                      ← EAS Build config (APK profiles)
└── package.json                  ← Dependencies (React 19, Expo 54, Firebase 12, Axios)
```

---

## 2. Architecture & Code Organization

### Organization Style
**Hybrid: feature-grouped screens + layered services.** Screens are grouped by feature (`event/`, `profile/`, `run/`) under `app/`. Business logic is extracted into a service layer (`utils/services/`) with one file per backend domain. Shared UI lives in `components/`, shared state in `contexts/`.

### Expo Router File-Based Routing
Every `.js` file inside `app/` automatically becomes a route. The URL path mirrors the folder structure:
- `app/(tabs)/index.js` → `/` (home tab)
- `app/event/[id].js` → `/event/123` (dynamic segment)
- `app/(common)/cart.js` → `/cart` (parenthesized groups don't appear in URL)
- `app/(tabs)/_layout.js` → defines the bottom tab bar for all files inside `(tabs)/`

### Navigation Hierarchy
```
Stack (app/_layout.js)
├── (tabs)  ← Bottom tab navigator
│   ├── index        (Home)
│   ├── run          (My Runs)
│   ├── submit       (Submit Proof — tab bar hidden on this screen)
│   ├── rank         (Delivery Tracking)
│   └── profile      (Profile)
├── login            ← Presented modally or pushed
├── event/
│   ├── [id]         ← Event detail
│   ├── select-package
│   ├── register
│   └── payment
├── run/[id]         ← Registration detail
├── profile/
│   ├── edit
│   ├── settings
│   ├── history
│   └── completed
├── (common)/
│   ├── cart
│   ├── checkout
│   ├── notifications
│   └── search
└── shipment/[id]
```

---

## 3. Reusable Components Analysis

### FormInput.js
**Purpose:** Themed text input with optional label, supports multiline and custom keyboard type.
**Props:** `label`, `placeholder`, `value`, `onChangeText`, `theme`, `multiline?`, `keyboardType?`
**Used by:**
- `app/event/register.js` — address and contact fields
- `app/(tabs)/submit.js` — distance, HH/MM/SS fields
**Reusable:** Yes — fully generic, works anywhere a labeled input is needed.

---

### Logo.js
**Purpose:** App brand logo rendered in three sizes. Displays "KAOTORPAI" (English) and "ก้าวต่อไป" (Thai) with a decorative divider.
**Props:** `size` — `'small'` | `'normal'` | `'large'` (default: `'normal'`)
**Used by:**
- `app/login.js` (line 172) — large size at login screen top
- `components/TopNavigation.js` (line 46) — small size in tab headers
**Reusable:** Yes — pure presentational, no dependencies.

---

### LoginPrompt.js
**Purpose:** Full-screen placeholder shown when a user-specific screen is opened without being logged in. Shows a message and a "Login" button.
**Props:** `message?` (string, optional — defaults to generic message)
**Used by:**
- `app/(tabs)/run.js`
- `app/(tabs)/submit.js`
- `app/(tabs)/rank.js`
- `app/(tabs)/profile.js`
**Reusable:** Yes — used consistently across all four tab screens.

---

### TopNavigation.js
**Purpose:** Header bar for tab screens. Shows logo, search button, cart icon with badge count, notification indicator, and settings (on Profile tab only).
**Props:** `activeTab` (string), `isDark` (boolean)
**Internal Logic:** Loads cart count from AsyncStorage on mount; navigates to `/search`, `/(common)/cart`, `/(common)/notifications`.
**Used by:** All five tab screens.
**Reusable:** Yes — tab screens only; detail screens use `TopNavigationBack` instead.

---

### TopNavigationBack.js
**Purpose:** Header bar for detail/form screens. Shows a back chevron on the left and a centered title.
**Props:** `title` (string), `onBack?` (function — defaults to `router.back()`), `isDark` (boolean)
**Used by:** Every screen outside the tab group (event detail, register, payment, run detail, profile edit, history, etc.)
**Reusable:** Yes — drop-in for any detail screen.

---

### Skeleton.js
**Purpose:** Animated pulsing loading placeholders. Exports three variants.
**Exports:**
- `SkeletonBox` — generic animated box (configurable size/border-radius)
- `EventCardSkeleton` — card-shaped placeholder for event list items
- `EventDetailSkeleton` — full-page placeholder for event detail screen
**Animation:** Opacity pulse 0.3 → 0.7, 800ms loop.
**Used by:**
- `app/(tabs)/index.js` — `EventCardSkeleton` during first load
- `app/event/[id].js` — `EventDetailSkeleton` during fetch
**Reusable:** Yes — `SkeletonBox` can be composed for any new screen.

---

### Inline Components (Extraction Candidates)

The following components are defined inside screen files and should be candidates for extraction to `components/`:

| Component | Defined In | Purpose | Lines |
|---|---|---|---|
| `TimelineStep` | `rank.js` | Vertical timeline step with status circle, label, detail, tracking copy, confirm button | 22–73 |
| `PickerModal` | `register.js`, `profile/edit.js` | Bottom-sheet modal for geography selection (Province/District/Sub-District) | ~18–53 (duplicated!) |
| `MenuOption` | `profile.js`, `profile/settings.js` | Tappable menu row with icon, label, chevron | duplicated |
| `SortButton` | `profile/history.js` | Pill toggle button for sort options | 106–119 |
| `InfoRow` | `event/[id].js` | Label + value row used in event detail | 102–112 |

**Highest priority for extraction:** `PickerModal` — it is **copy-pasted** between `register.js` and `profile/edit.js` with identical logic.

---

## 4. Screen-by-Screen Detail

### Screen: `/` → `app/(tabs)/index.js`
**Lines:** 182 total
**Purpose:** Home feed — shows paginated public events with status badges and pull-to-refresh.
**API Endpoints:**
- `GET /events/public?page=&limit=10` — paginated event list
**State:**
- `events[]`, `loading`, `refreshing`, `page`, `hasMore`
**Effects:**
- On mount: fetch page 1
- On scroll end: fetch next page (infinite scroll)
**Auth Required:** No
**Key UI Sections:**
1. Event cards — cover image, title, status badge, days remaining, price, registration count
2. Skeleton loading state — `EventCardSkeleton` while fetching
3. Load-more trigger at list end
**Navigation:**
- Tapping event card → `router.push('/event/[id]')`
**Status Badge Logic:** `getStatusConfig(event)` resolves one of: CLOSED / COMING SOON / REGISTER NOW / SUBMIT OPEN / FINISHED based on date ranges.

---

### Screen: `/login` → `app/login.js`
**Lines:** 296 total
**Purpose:** Unified login + register screen. Supports email/password and Google OAuth. Handles redirect back to original destination after login.
**API Endpoints:** (via AuthContext)
- `POST /auth/login`
- `POST /auth/register`
**State:**
- `isRegister`, `email`, `password`, `username`, `loading`
**Auth Required:** No (this is the auth screen)
**Key UI Sections:**
1. Logo
2. Google Sign-In button (isolated in `GoogleSignInButton` wrapper to satisfy hook rules)
3. Email + password fields; optional username field (register mode only)
4. Submit button
5. Toggle: "Already have an account? Login" / "No account? Register"
**Navigation:**
- Success → `router.replace(redirect || '/(tabs)')`
- Close → `router.back()`
**Hardcoded Client IDs:** Web and Android Google OAuth client IDs on lines 18 and 30.

---

### Screen: `/run` → `app/(tabs)/run.js`
**Lines:** 277 total
**Purpose:** Shows the user's registrations and running progress. Each card shows payment status, distance progress bar, result status, and context-sensitive action buttons.
**API Endpoints:**
- `GET /registrations/my`
**State:**
- `registrations[]`, `loading`, `refreshing`
**Effects:**
- `useFocusEffect` — re-fetches every time tab comes into focus
**Auth Required:** Yes (`useAuthCheck`, renders `LoginPrompt` if not authenticated)
**Key UI Sections:**
1. Registration card: event image, title, package, price
2. Payment status badge
3. Progress bar: current KM / target KM
4. Running result badge (approved / rejected / flagged / pending)
5. Action buttons conditional on status: Pay Now / Cancel / Re-upload Slip / Submit Proof
**Navigation:**
- Card tap → `/run/[id]`
- Pay Now → `/event/payment?registrationId=...`
- Submit Proof → `/(tabs)/submit`

---

### Screen: `/submit` → `app/(tabs)/submit.js`
**Lines:** 392 total
**Purpose:** Full-screen form to submit a running proof. User selects an eligible event, uploads a screenshot from Strava/Garmin/etc., enters distance and duration, then submits.
**API Endpoints:**
- `GET /registrations/my` — to find eligible registrations
- `POST /files/upload/running-proofs` — image upload (FormData)
- `POST /running-proofs` — create proof record
- `POST /running-results` — link proof to registration
**State:**
- `eligibleRegs[]`, `loading`, `selectedReg`, `showPicker`, `distance`, `hours`, `minutes`, `seconds`, `proofImage`, `submitting`
**Eligibility Filter:** Registration must be `paymentStatus: confirmed`, `status: active`, not cancelled, and within the event's submit window.
**Auth Required:** Yes
**Key UI Sections:**
1. Event selector (modal FlatList — only shows eligible events)
2. Target KM reminder badge
3. Image upload zone (gallery + camera options)
4. Distance input (decimal-pad)
5. Duration HH:MM:SS inputs
6. Pace warning box (> 3.5 min/km flagged)
7. Fixed footer with SUBMIT PROOF button
**Special:** Tab bar is hidden on this screen (`tabBarStyle: { display: 'none' }` in `_layout.js`).

---

### Screen: `/rank` → `app/(tabs)/rank.js`
**Lines:** 255 total
**Purpose:** Shows shipment status as a 4-step vertical timeline for each confirmed registration.
**API Endpoints:**
- `GET /registrations/my` — registrations with shipment data
- `PATCH /shipments/:id/confirm-delivery` — user confirms receipt
**State:**
- `items[]`, `loading`, `refreshing`
**Auth Required:** Yes
**Key UI Sections:**
1. Event card header: thumbnail, title, package
2. Vertical timeline:
   - Step 1: Payment — always completed ✓
   - Step 2: Running Progress — shows progress bar with current/target KM
   - Step 3: Shipped — shows carrier + tracking number with copy button
   - Step 4: Delivered — shows confirm button or confirmed date
**Inline Component:** `TimelineStep` (lines 22–73) — candidate for extraction to `components/`.

---

### Screen: `/profile` → `app/(tabs)/profile.js`
**Lines:** 221 total
**Purpose:** User profile hub showing computed stats (total KM, event count), a horizontal list of completed events, and navigation to sub-pages.
**API Endpoints:**
- `GET /registrations/my`
- `GET /running-proofs/my`
- `GET /running-results/my`
**State:**
- `stats: { events, totalKm, approvedResults, proofCount }`, `completedEvents[]`, `refreshing`
**Auth Required:** Yes
**Avatar:** Generated from `https://i.pravatar.cc/150?u={userId}`.
**Key UI Sections:**
1. Avatar + username + email
2. Stats grid: Total KM / Events Count
3. Completed events horizontal scroll
4. Menu rows: Run History (with count badge) / Settings

---

### Screen: `/event/[id]` → `app/event/[id].js`
**Lines:** 284 total
**Purpose:** Event detail page. Shows full event info, package options, and a smart bottom button that adapts based on the user's registration state.
**API Endpoints:**
- `GET /events/:id`
- `GET /packages/event/:eventId`
- `GET /registrations/my` — to detect existing registration
**Smart Button Logic:**

| State | Button |
|---|---|
| Not registered, event open | Register Now → `/event/select-package` |
| Registered, payment pending | Pay Now → `/event/payment` |
| Registered, payment rejected | Re-upload Slip → `/event/payment` |
| Registered, confirmed | Registered (disabled) |
| Event closed | Registration Closed (disabled) |
| Event not yet open | Not Yet Open (disabled) |

---

### Screen: `/event/select-package` → `app/event/select-package.js`
**Lines:** 297 total
**Purpose:** Select a package and item variants (e.g., shirt size), then add to cart.
**Storage:** Cart persisted in `AsyncStorage` under key `'cart'`.
**Auth:** Guarded by `useAuthGuard()` (redirects to login if not authenticated).

---

### Screen: `/event/register` → `app/event/register.js`
**Lines:** 468 total
**Purpose:** Full registration form — package confirmation, shipping address, cascading geography selectors (province → district → sub-district).
**API Endpoints:**
- `GET /events/:id`, `GET /packages/event/:eventId`
- `GET /provinces`, `GET /districts?provinceId=`, `GET /sub-districts?districtId=`
- `POST /registrations`
**Inline Component:** `PickerModal` (lines 18–53) — duplicated from `profile/edit.js`. Should be extracted.

---

### Screen: `/event/payment` → `app/event/payment.js`
**Lines:** 317 total
**Purpose:** Payment via PromptPay. Shows QR code, lets user upload a payment slip, then shows different views based on payment status.
**Views by Status:**

| `paymentStatus` | View Shown |
|---|---|
| `confirmed` | Success screen with confetti-style UI |
| `pending_verification` | "Awaiting review" screen |
| `rejected` | Rejection reason + re-upload option |
| `pending` | QR code + slip upload form |

---

### Screen: `/run/[id]` → `app/run/[id].js`
**Lines:** 246 total
**Purpose:** Deep-dive view of a single registration — full progress tracking, daily target calculation, latest submitted proof, and payment/action buttons.
**Calculations:**
- Days remaining = `event.endDate - today`
- Required daily KM = `(targetKm - currentKm) / daysLeft`

---

### Screen: `/profile/history` → `app/profile/history.js`
**Lines:** 240 total
**Purpose:** Full run history list with 4 sort options (Recent, Distance, Time, Pace) and tap-to-expand image viewer.
**Helpers:** `formatDuration()`, `calcPace()` (derived from distance + duration string).

---

## 5. User Flow Diagrams

### Flow 1: Authentication
```
App start
  └─ app/_layout.js → AuthProvider mounts
       └─ onAuthStateChanged fires
            ├─ [Firebase user exists]
            │    └─ syncBackendUser() → GET /users/me
            │         └─ Save userData → isAuthenticated = true
            └─ [No Firebase user]
                 └─ isAuthenticated = false

User taps protected action (e.g. Register button in event detail)
  └─ router.push('/login?redirect=/event/select-package?eventId=X')
       └─ Login screen
            ├─ Email/Password
            │    └─ Firebase signInWithEmailAndPassword
            │         └─ getIdToken() → POST /auth/login
            │              ├─ 200 → save user → router.replace(redirect)
            │              └─ 401 → auto POST /auth/register → same
            └─ Google OAuth
                 └─ expo-auth-session → Google ID token
                      └─ Firebase signInWithCredential
                           └─ same backend sync as above
```

### Flow 2: Event Registration & Payment
```
Home (index.js)
  └─ Tap event card → /event/[id]
       └─ Tap "Register Now"
            ├─ [Not logged in] → /login?redirect=/event/select-package?eventId=X
            └─ [Logged in] → /event/select-package?eventId=X
                 └─ Select package + variants → Add to Cart
                      └─ AsyncStorage.setItem('cart', ...)
                           └─ View Cart modal
                                └─ "Proceed to Register" → /event/register
                                     └─ Fill address + geography
                                          └─ POST /registrations
                                               └─ router.replace('/event/payment?registrationId=Y')
                                                    └─ GET /payments/qr/Y (QR code)
                                                         └─ Upload slip image
                                                              └─ POST /files/upload/slips
                                                                   └─ POST /payments/Y/submit-slip
                                                                        └─ Status: pending_verification view
```

### Flow 3: Submit Running Proof
```
Tab: Submit (/(tabs)/submit)
  └─ [Not logged in] → LoginPrompt
  └─ [Logged in] → GET /registrations/my → filter eligible
       └─ Select event (modal)
            └─ Upload proof image (gallery or camera)
                 └─ Enter distance + HH:MM:SS
                      └─ Tap "SUBMIT PROOF"
                           └─ POST /files/upload/running-proofs (image)
                                └─ POST /running-proofs (record)
                                     └─ POST /running-results (link to registration)
                                          └─ Alert success → router.push('/(tabs)/run')
```

### Flow 4: Delivery Tracking
```
Tab: Delivery (/(tabs)/rank)
  └─ [Not logged in] → LoginPrompt
  └─ [Logged in] → GET /registrations/my (includes shipments + shipmentStaff)
       └─ Per registration → compute 4-step timeline state:
            Step 1 Payment  → always "completed"
            Step 2 Running  → "active" until currentKm >= targetKm
            Step 3 Shipped  → "active" if shipment.status in [shipped, delivered]
                              Shows carrier + trackingNumber (from shipmentStaff[0])
                              Copy-to-clipboard button
            Step 4 Delivered→ "active" if shipped, show "Confirm Receipt" button
                              → PATCH /shipments/:id/confirm-delivery
```

### Flow 5: Profile & Settings
```
Tab: Profile
  └─ [Not logged in] → LoginPrompt
  └─ [Logged in]
       ├─ Tap "See All" completed events → /profile/completed
       ├─ Tap "Run History" → /profile/history
       └─ Tap "Settings" → /profile/settings
            ├─ "Edit Profile" → /profile/edit
            │    └─ Load /users/me + provinces cascade
            │         └─ PATCH /users/me → router.back()
            └─ "Logout" → Firebase signOut → clear AsyncStorage → router.replace('/(tabs)')
```

---

## 6. API Integration Layer

### 6.1 API Client — `utils/api.js`
- **Base URL:** `https://virtual-run-production.up.railway.app/api/v1`
- **Timeout:** 15,000ms
- **Request interceptor (lines 13–23):** Every request automatically calls `getToken()` (reads `firebase_id_token` from AsyncStorage) and injects `Authorization: Bearer <token>`.
- **Response interceptor (lines 29–40):** On `401`, clears token via `clearToken()` — but **only** for non-auth endpoints. Auth endpoints (`/auth/login`, `/auth/register`) are allowed to return 401 without triggering a logout, enabling the auto-register-on-first-login flow.

### 6.2 Auth Flow — `contexts/AuthContext.js`
Firebase is the identity provider. The backend is a separate user store synced from Firebase.

**Step-by-step login:**
1. User submits credentials → Firebase SDK authenticates
2. Firebase returns an ID token (`getIdToken()`)
3. Token saved to AsyncStorage (`firebase_id_token`)
4. `POST /auth/login` — Backend verifies Firebase token, returns backend user
5. If `401` → user doesn't exist in backend → auto-call `POST /auth/register`
6. Backend user saved to AsyncStorage (`user_data`) and context (`userData`)
7. All subsequent API requests carry the Bearer token automatically

**Token persistence:** `utils/storage.js` wraps AsyncStorage with typed helpers.
`TOKEN_KEY = 'firebase_id_token'` | `USER_KEY = 'user_data'`

**`refreshUserData()`:** Lightweight `GET /users/me` that updates context without re-authenticating. Called after profile edits.

### 6.3 Service Layer — `utils/services/`

| File | Key Exports | Backend Endpoints |
|---|---|---|
| `authService.js` | `loginWithToken`, `registerUser` | POST /auth/login, POST /auth/register |
| `eventService.js` | `getPublicEvents`, `getEventById`, `getEventPackages`, `getEventItems` | GET /events/public, /events/:id, /packages/event/:id |
| `registrationService.js` | `createRegistration`, `getMyRegistrations`, `getRegistrationById`, `cancelRegistration`, `updateRegistration` | /registrations/* |
| `runningProofService.js` | `uploadProofImage`, `createRunningProof`, `createRunningResult`, `getMyRunningProofs`, `getMyRunningResults` | /files/upload/running-proofs, /running-proofs, /running-results |
| `paymentService.js` | `getPaymentQR`, `submitSlip`, `uploadSlipImage` | /payments/* |
| `shipmentService.js` | `getMyShipments`, `getShipmentById`, `confirmDelivery` | /shipments/* |
| `userService.js` | `getMyProfile`, `updateProfile` | GET/PATCH /users/me |
| `geographyService.js` | `getProvinces`, `getDistricts`, `getSubDistricts` | /provinces, /districts, /sub-districts |
| `notificationService.js` | `getMyNotifications`, `getUnreadCount`, `markAsRead`, `markAllAsRead` | /notifications/* |

---

## 7. State Management Pattern

**No global state library** (no Redux, Zustand, etc.). The pattern is:

| Layer | What it stores | Where |
|---|---|---|
| `AuthContext` | Firebase user, backend user data, `isAuthenticated`, auth functions | React Context |
| `AsyncStorage` | Firebase ID token, user JSON, shopping cart | Device storage (persistent) |
| `useState` (per screen) | Screen-local data (events, registrations, form fields) | Component state |

**Shopping cart:** Stored as a JSON array in AsyncStorage under key `'cart'`. Updated by `select-package.js`, read by `cart.js` and `TopNavigation.js` (for badge count). No reactive subscription — screens re-read on focus.

**No global non-auth state.** Each screen fetches its own data on focus/mount. `useFocusEffect` is used on tab screens to always show fresh data.

---

## 8. Styling & Theme System

### Design System — `constants/GlobalStyles.js` (363 lines)

**Color Tokens:**
```
PRIMARY_YELLOW  #F2CC0F   — brand accent, active states, CTAs
DARK_BG         #212121   — dark mode background
LIGHT_BG        #FFFFFF   — light mode background
SUCCESS         #4CD964   — approved / confirmed states
ERROR           #FF3B30   — rejected / error states
WARNING         #FF9500   — flagged / warning states
INFO            #007AFF   — informational badges
GRAY_900–5               — full neutral scale for borders, text, cards
```

**Dark/Light Mode:**
Every screen calls `useColorScheme()` → passes result to `getTheme(isDark)` which returns a theme object:
- `background`, `text`, `card`, `border`, `textSecondary`, `textTertiary`, `inputBg`, `inputBorder`

All colors used in JSX reference `theme.X` (not hardcoded) — ensuring instant dark/light switching.

**Typography Scale:**
```
h1–h4        — headings (28px down to 18px, bold)
bodyLarge    — 17px
body         — 15px
bodyMedium   — 14px
bodySmall    — 12px
caption*     — 11px, 10px, 9px
badge        — 11px, uppercase
buttonLarge  — 17px, bold
statLarge/Medium/Small — for dashboard numbers
```

**Layout Utilities:** `Layout.padding`, `Layout.rowCenter`, `Layout.rowBetween`, `Layout.centerAll`
**Component Presets:** `Components.card`, `Components.cardLarge`, `Components.button`, `Components.buttonLarge`, `Components.badge`
**Screen Presets:** `ScreenStyles.footer` — absolute-positioned bottom action bar with safe-area padding

**Consistency:** All screens use the theme system. No screens were found with hardcoded color values in theme-aware contexts.

---

## 9. Future Extensibility Guide

### Adding a New Screen

1. **Create file:** `app/your-feature/screen-name.js`
2. **Routing is automatic** — Expo Router discovers the file; no manifest needed.
3. **Reuse components:**
   - Use `TopNavigationBack` for the header
   - Use `FormInput` for any inputs
   - Use `LoginPrompt` if the screen requires auth
   - Use `SkeletonBox` for loading state
4. **Auth guard:** Add `const { isReady } = useAuthGuard();` at the top to redirect unauthenticated users. Or use `useAuthCheck()` to render `LoginPrompt` inline.
5. **Connect to API:** Create a function in the relevant `utils/services/` file; call it in a `useEffect` or `useFocusEffect`.
6. **Styling:** Call `const isDark = useColorScheme()` + `const theme = getTheme(isDark)` at the top. Use `theme.X` and `COLORS.X` constants — never hardcode colors.

### Specific Future Features

**Push Notifications (FCM):**
- Install `expo-notifications` and `@react-native-firebase/messaging`
- Register token in `AuthContext.js` after login (`syncBackendUser` function, line 31)
- Add handler in `app/_layout.js` (root layout, so it persists across all screens)
- Backend notification sending already exists (`notificationService.js` is ready)
- `components/TopNavigation.js` already shows a notification indicator — wire it to real data from `getUnreadCount()`

**Leaderboard / Ranking:**
- Backend endpoint needed: `GET /leaderboard?eventId=`
- Add `leaderboardService.js` in `utils/services/`
- The current `rank.js` tab is used for delivery tracking — consider a new tab or a leaderboard section inside `run/[id].js` per event

**Social Features (Share Results):**
- Use `expo-sharing` + `expo-file-system`
- Best entry point: `profile/history.js` — each run card already has distance, pace, duration
- Add a share button to `TimelineStep` in `rank.js` to share a proof of completion

**Multi-Language Support:**
- All Thai strings are hardcoded throughout screens — no i18n library is used
- Adding i18n would require replacing all Thai strings with `t('key')` calls
- Framework recommendation: `i18next` + `react-i18next`
- Effort: **High** — every screen file would need changes

**Avatar Upload:**
- Currently uses `https://i.pravatar.cc/150?u={userId}` (auto-generated)
- `expo-image-picker` is **already installed** (used for running proof upload)
- `uploadProofImage()` pattern in `runningProofService.js` can be copied for avatar upload
- Backend needs a `POST /users/me/avatar` endpoint
- UI: Add a tap handler on the avatar circle in `profile.js`

### Components That Should Be Extracted

| Pattern | Currently Duplicated In | Suggested Component |
|---|---|---|
| `PickerModal` (geography picker bottom sheet) | `register.js`, `profile/edit.js` — **copy-paste** | `components/PickerModal.js` |
| `MenuOption` (tappable row with icon + chevron) | `profile.js`, `profile/settings.js` | `components/MenuOption.js` |
| `getPaymentBadge()` / `getResultBadge()` | `run.js`, `run/[id].js` | `components/StatusBadge.js` |
| `getImageUrl()` helper | Every screen file | `utils/imageUrl.js` |
| Empty list state (icon + text + CTA button) | `run.js`, `rank.js`, `profile/completed.js` | `components/EmptyState.js` |
| Loading screen (ActivityIndicator centered) | Every screen | `components/LoadingScreen.js` |
| `TimelineStep` | `rank.js` only but complex | `components/TimelineStep.js` |
| `SortButton` | `profile/history.js` | `components/SortButton.js` |

---

## 10. Known Issues & Technical Debt

### Mock / Placeholder Data
- **Pravatar avatars:** `profile.js` uses `https://i.pravatar.cc/150?u={userId}` — no real avatar upload exists yet.
- **Placeholder event images:** `index.js` line 13 falls back to `https://via.placeholder.com/60x60/333/666?text=E` for missing cover images.

### Hardcoded Values That Should Be Configurable
| Value | Location | Issue |
|---|---|---|
| `SUPABASE_URL` | `index.js`, `submit.js`, `rank.js`, `event/[id].js` | Repeated string — should be a single constant in `constants/` |
| `CART_KEY = 'cart'` | `select-package.js`, `cart.js`, `TopNavigation.js` | Defined 3 times separately |
| Pace threshold `3.5` | `submit.js` line 110 | Business rule hardcoded; should be configurable |
| Pagination limit `10` | `index.js`, `eventService.js` | Defined in two places |
| Firebase Client IDs | `login.js` lines 18, 30 | Exposed in source; should be in `.env` |
| Backend API URL | `utils/api.js` line 4 | Should be in `.env` / `app.config.js` |

### Missing Error Handling
- **`cart.js`:** `AsyncStorage` errors silently caught with empty `catch {}` (lines 43, 75).
- **`profile.js`:** API errors on load are caught and logged but not shown to the user — screen silently shows empty stats.
- **`submit.js`:** Image picker failure (cancelled) is handled but errors from `uploadProofImage` only surface an alert with generic "Failed to submit proof" message.

### Console Logs Left in Production Code
| File | Line | Log |
|---|---|---|
| `login.js` | 24 | `console.log('Google OAuth Redirect URI:', redirectUri)` |
| `run.js` | 61 | `console.error('Failed to fetch registrations:', err)` |
| `submit.js` | 64 | `console.error(err)` |
| `rank.js` | 124 | `console.error(err)` |
| `profile.js` | 65 | `console.error(err)` |

### Code Duplication
- `getImageUrl()` is copy-pasted into 6+ screen files.
- `PickerModal` is fully duplicated between `register.js` and `profile/edit.js`.
- `getPaymentBadge()` and `getResultBadge()` are duplicated between `run.js` and `run/[id].js`.

### Architecture Notes
- `getMyShipments()` (`GET /shipments/my`) exists in `shipmentService.js` but is **never called** — `rank.js` loads shipment data by calling `getMyRegistrations()` and reading the embedded `shipments[]` relation.
- Cart system uses `AsyncStorage` with no reactive updates — `TopNavigation.js` re-reads the cart count only on mount, not on cart changes.
- The `app/(common)/checkout.js` screen is registered in the router but its implementation was not audited in this analysis.
