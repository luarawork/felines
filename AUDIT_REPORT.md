# Felines — Full Codebase Audit Report

Three-part audit (bugs, refactoring, security) completed across the entire
codebase. Work was split across four parallel passes: auth/colony/map bugs,
reports/help/learn/profile/notifications bugs, code quality, and security.

## 1. Bugs found and fixed

| # | Bug | File(s) | Fix |
|---|-----|---------|-----|
| 1 | Articles marked "read" on page mount instead of scroll-to-bottom | `components/ArticleProgressTracker.tsx` | Now records `knowledge_progress` only within 48px of the bottom of the article, matching `ReadingProgressBar`'s threshold |
| 2 | Feeding/water check-in double-click race | `components/ColonyActions.tsx` | Added a `checkInPending` guard disabling both buttons the instant a click registers, instead of only after the insert resolves |
| 3 | `NeuteringRequestBanner` built but never rendered | `components/ColonyDetailClient.tsx` | Imported and rendered next to `HelpRequestBanner` — caretakers previously had no way to advance a neutering request's status from the colony page |
| 4 | `FlagButton` allowed duplicate flags per user (generic flag flow) | `components/FlagButton.tsx` | Client-side handling of unique-violation as "already flagged" + pending migration `0070` |
| 5 | SignupForm ignored `returnTo`, never redirected post-signup | `components/SignupForm.tsx`, `app/signup/page.tsx` | Reads `returnTo`, redirects on live session, forwards into post-confirmation login link; wrapped page in `<Suspense>` (was a pre-existing build-breaking bug — `useSearchParams()` requires it) |
| 6 | `knowledge_progress` upsert had no matching unique constraint | `supabase/migrations/0069` (pending) | `ON CONFLICT (user_id, article_slug)` was silently failing/duplicating without a backing unique index |
| 7 | False-pin flags had no per-user-per-colony uniqueness at the DB level | `supabase/migrations/0069` (pending) | Partial unique index scoped to the 4 false-pin reasons |
| 8 | `notify_caretakers`/`notify_nearby_caretakers` accepted arbitrary free-text from the caller, exploitable via direct anon RPC call | `supabase/migrations/0065` (**already applied**) | Message now built server-side from a validated `p_type`/`p_report_type`, caller text never stored |
| 9 | `profiles.current_streak/longest_streak/last_action_date` were publicly readable by anyone, contradicting the migration 0043 comment that streaks are never public | `supabase/migrations/0066` (pending) | Revoked table-wide SELECT, added `get_own_streak()` RPC gated to `auth.uid() = id` |
| 10 | `colonies.name/narrative`, `cats.name`, `reports.description`, `caretakers.letter` had **no DB-level length limit at all** | `supabase/migrations/0067` (pending) | Added `char_length` CHECK constraints, matching the pattern already used on stories/help_requests/resource_posts |
| 11 | `thank_action()` never blocked self-thanking (unlike `confirm_report`'s explicit guard) | `supabase/migrations/0068` (pending) | No-ops if the caller authored the timeline event being thanked |

## 2. Security issues found and fixed

Of the 11 bugs above, **5 are security-relevant** (#4, #6, #8, #9, #11) and one
is a data-integrity gap that's also an abuse surface (#10 — unbounded text
fields via direct REST calls with the public anon key).

Additional security items verified as **already correct** (no change needed):
- Exact `latitude`/`longitude` on `colonies` and `reports` — confirmed via live anon-key curl requests, both return `permission denied`; blurred columns succeed.
- `knowledge_progress` cross-user read — confirmed empty result for unauthenticated/cross-user access.
- File upload: MIME-type checked (not just extension), 5MB limit enforced both client-side and at the Supabase bucket level, storage paths always machine-generated (no path traversal).
- No `dangerouslySetInnerHTML` anywhere in the repo (checked for XSS via story text, colony narratives, cat names, letters).
- No `select("*")` anywhere in app code.
- No service-role key or other secret in app code or git history.
- All 4 `NEXT_PUBLIC_*` env vars are genuinely meant to be public; `.env.local` is gitignored; `.env.example` created (was missing).
- `confirm_report`/`mark_cat_seen_today` — atomic UPDATE, no race condition.
- Security headers (`next.config.ts`) — added `Content-Security-Policy` and `Permissions-Policy` (were missing; `X-Frame-Options`/`X-Content-Type-Options`/`Referrer-Policy` already existed).
- `npm audit` — 2 moderate findings, both in a transitive `postcss` dependency bundled inside `next`'s own `node_modules`; no fix available without a major Next.js downgrade. Flagged, not actionable.

**Flagged, not fixed (needs a decision):**
- **Resource/story/flag submission has no rate limiting**, unlike `/api/reports`. Severity: low-medium (all require auth, so abuse is at least traceable to an account). Effort: **Medium** — needs a `lib/rateLimit.ts`-style module wired into each insert path.
- **Session expiry mid-action**: no global interceptor for an expired JWT during a mid-form action; each form just shows a generic error. Effort: **Medium** — needs a UX decision (silent refresh vs. force re-login) before implementing a shared wrapper.

## 3. Refactoring changes made

The code-quality pass found the codebase already close to clean:
- **Zero** real `any`/`as any` usages found.
- Lint was already clean (no unused vars/imports, no missing hook dependencies) before this audit started.
- All `<img>` tags already carry deliberate `eslint-disable` comments for dynamic Supabase storage URLs.
- All three `key={index}` usages found are on genuinely static/non-reorderable lists (progress dots, a fixed feature list, a single-item remount trick) — not the reordering-bug pattern, left as-is.
- Form validation logic already shared via `lib/storage.ts` (`validatePhotoFile`, `buildSafeStoragePath`) across all upload forms — no duplication found.
- One real fix made: `components/CaretakerLetters.tsx` was computing the same `.filter()` twice per render; extracted into a single `useMemo`.

**Flagged, not fixed (needs larger, riskier work):**
- 6 components exceed the project's own 150-line target: `GlobalSearchButton.tsx` (330), `NewColonyForm.tsx` (455), `CatManager.tsx` (426), `HelpFlow.tsx` (314), `app/page.tsx` (301), `EditColonyForm.tsx` (265). Effort: **Large** — genuine extraction/splitting work, correctly out of scope for a blind pass.
- `lib/submitReport.ts`'s `type`/`status` fields could be narrowed to unions matching the codebase's existing `"pt" | "en"` pattern. Effort: **Small**, deferred since the file was actively being edited by the bug-hunt pass during this session.

## 4. Effort-estimated backlog (not fixed this session)

| Item | Effort | Why deferred |
|---|---|---|
| Rate limiting on resource/story/flag submission | M | New shared module needed across multiple insert paths |
| Session-expiry recovery UX | M | Needs a product decision on silent-refresh vs. force-relogin |
| Split 6 components over 150 lines | L | Extraction risk too high for a blind pass; needs dedicated review |
| Union types for `submitReport`'s `type`/`status` | S | Blocked on other in-flight edits to the same file this session |

## 5. Patterns noticed

- The team already has strong conventions (helper functions taking `t` as a
  parameter to avoid `react-hooks/purity` violations, `security definer`
  functions with internal auth checks, migration comments explaining *why*)
  — most "bugs" the audit checklist anticipated turned out to already be
  handled correctly, a sign the codebase has had careful, incremental
  security review already (see `supabase/migrations/0047_security_advisor_fixes.sql`).
- The recurring real gap was **trusting client-supplied data server-side**
  in a few specific RPCs (`notify_caretakers`, missing length checks) —
  worth a standing habit of asking "what if this RPC is called directly via
  `/rest/v1/rpc/...` with the public anon key, bypassing the app entirely?"
  for any new SECURITY DEFINER function.
- Several components were fully built and correctly wired to their own data
  model but never actually rendered anywhere (`NeuteringRequestBanner`) —
  worth a quick "is this component imported anywhere?" grep pass after
  building a new feature.

## 6. Current state

- `npm run lint` — 0 errors, 0 warnings.
- `npm run build` — succeeds, all 21 routes compile cleanly.
- `npm audit` — 2 moderate (transitive, no actionable fix).
- Working tree clean; all changes committed in small, scoped commits.

## 7. Pending migrations (not yet run against the live database)

Per this project's rule, none of these were executed — they must be run
manually via the Supabase SQL editor, in order:

1. `supabase/migrations/0066_restrict_streak_columns_to_owner.sql`
2. `supabase/migrations/0067_missing_length_checks.sql`
3. `supabase/migrations/0068_prevent_self_thank.sql`
4. `supabase/migrations/0069_knowledge_progress_and_flag_uniqueness.sql`
5. `supabase/migrations/0070_flag_dedup_generic_reasons.sql`

(`0065_harden_notify_caretakers.sql` was already applied earlier this session.)

## 8. Recommendations for next steps

1. Run the 5 pending migrations above, in order (0066 → 0070).
2. Decide on the rate-limiting and session-expiry UX questions flagged above; both are self-contained enough to implement in a follow-up session once a direction is chosen.
3. Consider a dedicated session to split the 6 oversized components — each is a contained, well-understood piece of UI, so the risk is manageable with focused attention rather than a blind sweep.
4. Re-run `npm audit` after any future `next` major-version upgrade to confirm the transitive `postcss` advisory clears on its own.
