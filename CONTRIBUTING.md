# Contributing to Felines

Thanks for thinking about contributing — genuinely. Felines exists to
help people who aren't "cat people" find a way in, without gatekeeping or
guilt, and we want the same spirit to apply to the people who work on the
code. Whether you're here to fix a typo, squash a bug, or propose
something bigger, you're welcome.

This is a collaboration-over-competition project. There's no leaderboard
for contributions, no "best PR of the month." We're trying to build
something useful for stray cats and the people near them — that's the
whole point.

## Getting Set Up Locally

### Prerequisites

- Node.js 18+
- npm
- A free [Supabase](https://supabase.com) project
- A free [OpenWeatherMap](https://openweathermap.org/api) API key

### Steps

1. **Clone the repo:**
   ```bash
   git clone https://github.com/luarawork/felines
   cd felines
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up your environment.** Copy `.env.example` to `.env.local` and
   fill in the required variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   NEXT_PUBLIC_WEATHER_API_KEY=
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
   Both Supabase values come from your project's Project Settings → API.

4. **Run the database migrations.** `supabase/migrations/` contains
   numbered SQL files — run them **in order** in the Supabase SQL
   Editor (Dashboard → SQL Editor → paste each file's contents → Run).
   Most migrations assume everything before them has already been
   applied, so don't skip ahead.

5. **Start the dev server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Commit Message Convention

We use a lightweight prefix convention so history stays scannable:

- `feat:` — a new feature
- `fix:` — a bug fix
- `security:` — a security-relevant fix
- `style:` — visual/CSS changes with no behavior change
- `refactor:` — code changes that don't change behavior
- `docs:` — documentation only
- `chore:` — tooling, dependencies, non-code housekeeping

Keep the message focused on *why*, not just *what* — "fix: prevent
double-submission on feeding check-in" is more useful than "fix button".

## Opening a Good Issue

- **Search first** — someone may have already reported it.
- **Be specific.** What page, what action, what happened vs. what you
  expected. A screenshot or a short screen recording goes a long way.
- **One issue, one problem.** If you found three unrelated bugs, that's
  three issues, not one long one.
- If you're not sure whether something is a bug or intended behavior,
  ask — that's a totally fine use of an issue.

## Proposing a New Feature

Open an issue using the feature request template before writing code —
it's a lot easier to align on direction before a PR exists than after.
Tell us the problem you're trying to solve, not just the solution you
have in mind; sometimes there's a simpler fix already possible with
what's there.

## Code Standards

- **TypeScript strict mode** — the project is written in strict
  TypeScript; new code should be too. Avoid `any` unless there's truly
  no better option, and explain why in a comment if you do use it.
- **Every file starts with a purpose comment.** A line or two at the top
  explaining what the file is for and any non-obvious context — not a
  restatement of the filename.
- **Every function has a comment** explaining what it does, especially
  anything with a non-obvious reason for existing (a workaround, an edge
  case, a security consideration).
- **Validate on both the client and the server.** Client-side validation
  is a UX nicety; it is never a substitute for a database constraint or
  an RLS policy, since a direct API call bypasses your form entirely.
- **No hardcoded API keys.** Anything secret goes in an environment
  variable, documented in `.env.example`.

## Pull Request Checklist

Before opening a PR, please confirm:

- [ ] `npm run build` passes with zero errors
- [ ] `npm run lint` passes with zero warnings
- [ ] Tested at 375px width (mobile) — no horizontal overflow, no
      overlapping elements, touch targets at least 44×44px
- [ ] Both Portuguese and English translations updated, if you changed
      any user-facing text (`lib/i18n/pt.ts` and `lib/i18n/en.ts`)
- [ ] No new colors introduced outside the existing design system
      palette (`app/globals.css`'s `@theme` tokens)

## Does This Fit Felines?

Not every good idea fits this particular project, so before you invest
time in something larger, it's worth checking it against what Felines is
actually trying to do:

- **Collaboration over competition** — features should help people work
  together (a caretaker and a curious neighbor, a passerby and someone
  who already knows the colony), not create a scoreboard or a sense of
  "winning" at cat care.
- **Animal safety as a design decision, not an afterthought** — if a
  feature touches location data, photos, or anything that could expose
  a colony to harm, the default should be the more protective option,
  not the more convenient one.
- **Education through logic, not emotion** — the app leans on clear
  reasoning and real numbers rather than guilt or shock value to bring
  people in. New content and copy should keep that tone.

If you're not sure whether an idea fits, open an issue and ask — that's
what the feature request template's "does this align with Felines'
principles" question is there for.

Thanks again for contributing. However small or large your change is,
it's appreciated.
