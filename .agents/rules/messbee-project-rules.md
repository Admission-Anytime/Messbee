---
trigger: always_on
description: Strict development rules for MessBee Mobile App & Web Backend protection
---

# MessBee Project Rules (Strictly Enforced)

1. **Zero Changes to Web Backend or Web Client (`server/` & `client/`):**
   - **NEVER** modify, create, or delete any file inside `server/` or `client/` unless the user explicitly commands it.
   - Only read and analyze `server/` and `client/` to understand endpoints, schemas, and business logic.
   - Verify `git diff origin/main -- server/ client/` remains empty before every commit.

2. **100% Dynamic UI — Zero Hardcoded or Mock Data:**
   - Every new UI screen, card, list, chart, badge, or dropdown in `messbeeapp/` **MUST** fetch real data from live backend APIs (`messbeeapp/src/services/api.js`).
   - **NEVER** include hardcoded dummy data, static mock arrays, fake fallback counts, or placeholder `Alert.alert('Coming Soon')` buttons.
   - Always implement proper loading states, pull-to-refresh, and clean empty states when the API returns `[]`.

3. **Strict Form Validation:**
   - All user input forms must validate required fields, email/phone/URL/numeric formats using `messbeeapp/src/utils/validation.js` before calling backend APIs, and display real backend errors cleanly (never swallow errors as fake success).

4. **No Git Push Without Explicit User Command:**
   - **NEVER** run `git push` to `dev`, `main`, or any remote branch unless the user explicitly says to push or raise a PR.
   - Keep all work committed locally on the active feature branch (`mobile-work-v*`).
