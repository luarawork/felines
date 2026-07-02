# Third-Party License Compliance Notes

This file documents dependency-license findings flagged by automated
scanning (Aikido Security SCA) that were reviewed and accepted rather
than "fixed" in code, along with the reasoning — so the decision has a
record instead of living only in a chat thread.

## Finding: LGPL-3.0-or-later in `sharp` (image optimization)

**Aikido report:**

| License type | Dependency count | Legal risk |
|---|---|---|
| Apache-2.0 AND LGPL-3.0-or-later AND MIT | 1 | High |
| Apache-2.0 AND LGPL-3.0-or-later | 3 | High |
| LGPL-3.0-or-later | 10 | High |

**Root cause:** all 14 flagged packages trace back to a single
dependency — [`sharp`](https://github.com/lovell/sharp) (installed
version `0.34.5`), which is not in this project's `package.json` at
all. It's an optional transitive dependency of `next` itself, used
internally by `next/image` for server-side image resizing/optimization:

```
felines@0.1.0
└─ next@16.2.9
   └─ sharp@0.34.5
```

`sharp` bundles [`libvips`](https://github.com/libvips/libvips) (a C
image-processing library, LGPL-3.0-or-later) alongside its own
Apache-2.0/MIT-licensed JS and native-binding code — that's the
`"Apache-2.0 AND LGPL-3.0-or-later"` combination the scanner sees.

`sharp` ships this as **prebuilt binaries per OS/architecture**
(`@img/sharp-win32-x64`, `@img/sharp-linux-arm64`,
`@img/sharp-darwin-arm64`, `@img/sharp-libvips-*`, etc. — 25 packages
total in `package-lock.json`, only one of which actually gets
installed for any given machine). Aikido's SCA scans the full
declared dependency graph in the lockfile, not just what's installed
locally, so the same underlying license shows up ~14 times instead of
once.

**Why this is accepted as-is (not a code fix):**

1. **Ubiquity** — this is the same dependency essentially every
   production Next.js app carries the moment it uses `next/image`.
   It isn't a package this project chose to add; removing it means
   giving up Next's built-in image optimization.
2. **LGPL-3.0's actual obligation doesn't apply to how it's used
   here** — LGPL permits linking/using the library from proprietary
   software freely. The copyleft obligation (share source) only
   triggers if *libvips itself* is modified and redistributed. This
   project consumes `sharp`/`libvips` unmodified via `npm install`;
   it doesn't fork, patch, or redistribute the library.
3. **Aikido's "High" rating is a generic copyleft-family heuristic**,
   not a case-specific legal assessment — it flags any LGPL/GPL-family
   license as High by default, regardless of how the dependency is
   actually used (SaaS/webapp consumption vs. shipping/redistributing
   modified library code, which is what LGPL's obligations are aimed at).

**Alternative considered:** Next.js supports disabling the native
`sharp`-based image optimizer in favor of a slower WASM-based path
(no `sharp` dependency at all), or disabling `next/image` optimization
entirely. Not adopted — the performance cost applies to every image on
the site for a license obligation that doesn't actually bind this
project's usage.

**Status:** Risk accepted. Revisit if this project ever redistributes
modified `libvips`/`sharp` source, or if legal counsel advises
otherwise for a specific jurisdiction/context.

---

_Last reviewed: 2026-07-02, following an Aikido Security SCA scan._
