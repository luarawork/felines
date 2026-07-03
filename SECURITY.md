# Security Policy

Felines maps the location of stray cat colonies. That makes security here
about more than data privacy — a location leaked to the wrong person could
be used to find and harm real animals. We take that seriously, and we'd
rather hear about a problem from you, privately, than find out about it
from an incident report.

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**
Report privately instead, so we have time to fix the issue before it's
disclosed publicly.

- Email: luara.working@gmail.com with the subject line `[SECURITY] <short
  description>`.
- Include what you found, the steps to reproduce it, and — if you can —
  what you think the impact is. A proof-of-concept request/response
  (with any real data redacted) is more useful to us than a description
  alone.
- If you'd rather not use email, opening a [private security
  advisory](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability)
  on this repository works too.

We'll acknowledge your report within **3 business days**, and aim to have
a fix (or at least a clear remediation plan) within **7 days** for high
or critical issues, and **30 days** for lower-severity ones. We'll keep
you posted on progress the whole way — you shouldn't have to follow up
to find out what's happening.

Once a fix ships, we're happy to credit you in the fix's commit message
or in this file, if you'd like. If you'd rather stay anonymous, that's
fine too — just let us know your preference when you report.

## What's In Scope

Anything that could let someone:

- **Find the exact location of a colony or cat they shouldn't be able
  to.** This is the one we care about most — see [Progressive Location
  Blur](README.md#progressive-location-blur) for how location data is
  meant to be protected, at three trust levels, entirely at the
  database layer.
- Bypass Row Level Security or a Supabase RPC's authorization check —
  reading, writing, or deleting data they shouldn't have access to.
- Perform SSRF, path traversal, injection (SQL, XSS, etc.), or similar
  classic web vulnerabilities anywhere in the app or its API surface.
- Impersonate another user, or act on their behalf without
  authorization.
- Abuse the anonymous-report or rate-limiting paths in a way that
  degrades the service for everyone else.

Lower priority, but still worth reporting: issues in a dependency that
don't have a public CVE yet, or a misconfiguration that doesn't directly
expose data but weakens the app's defenses (e.g. a missing security
header).

**Out of scope:** social engineering, physical attacks, denial-of-service
via sheer volume (as opposed to a logic flaw), and issues that require
already having admin/service-role access to the Supabase project.

## What We Use to Audit This

Felines runs regular scans through [Aikido
Security](https://www.aikido.dev/) across the codebase and its
dependencies, alongside manual review — including live testing against
the real Supabase REST/RPC endpoints with the public anon key, not just
reading the code, since that's the same vantage point an attacker with
no account would have.

Aikido has already found and we've fixed:

- **Path traversal (HIGH)** in file upload paths — fixed by centralizing
  path construction with UUID-based filenames and sanitized prefixes,
  plus a defense-in-depth assertion at every upload call site.
- **SSRF (LOW)** in the reverse-geocoding request to Nominatim — fixed
  by validating coordinate ranges before any request is built, using
  `URLSearchParams` instead of string interpolation, and disabling
  redirect-following on the fetch.

Row Level Security is enabled on all 25 application tables, with no
"allow everything" fallback policy anywhere in the schema — see
[`AUDIT_REPORT.md`](docs/AUDIT_REPORT.md) for the full, itemized findings
(including internal review findings beyond the two above) and the
reasoning behind each fix, and the [README's Security
section](README.md#security) for the broader architecture.

## What to Expect After You Report

1. An acknowledgment within 3 business days.
2. An honest read on severity and likely timeline — we'd rather tell you
   "this will take a couple of weeks" than go quiet.
3. Updates as the fix progresses, without you having to ask.
4. A note once it ships, and credit if you want it.

Thank you for taking the time to report responsibly — it genuinely helps
keep both the platform and the animals it's meant to protect safer.
