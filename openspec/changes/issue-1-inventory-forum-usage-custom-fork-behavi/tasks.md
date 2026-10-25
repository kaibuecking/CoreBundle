## 1. Establish The Inventory Baseline

- [x] 1.1 Record the application, Forum submodule, and Core submodule revisions.
- [x] 1.2 Enumerate application references to Forum, con4gis Core, Groups, Projects, personal messages, subscriptions, and notifications in `inventory.md`.
- [x] 1.3 Inventory frontend/backend modules, templates, hooks, permissions, uploads, and persisted tables in `inventory.md`.
- [x] 1.4 Record the Composer/lock/runtime wiring, including the dual `kaibuecking/core` + `con4gis/core` state.

## 2. Classify The Custom Fork

- [x] 2.1 Enumerate all 11 Forum commits beyond `main` and all 3 Core commits beyond `main` in `delta-matrix.md`.
- [x] 2.2 Classify each commit as `retain`, `upstreamed`, `obsolete`, or `relocate`; split mixed commits into per-hunk targets.
- [x] 2.3 Record the upstream `v5.0.6` comparison as blocked with an exact authorized verification procedure.
- [x] 2.4 Record the non-deployed `customfeaturesV3` branch as observation only, not as an upstream comparison.

## 3. Inventory Persistence And Notifications

- [x] 3.1 Document Forum/subscription/PN/upload/avatar tables and relationships without records in `inventory.md`.
- [x] 3.2 Document the seven Notification Center types, tokens, module fields, and the legacy-vs-NC PN e-mail behavior.
- [x] 3.3 Document data-dependent constants: category IDs, thread IDs, sender ID, subjects, upload folders, group IDs.
- [x] 3.4 Document the custom PN API and its private-chat/login callers.

## 4. Produce Operator-Safe Checks

- [x] 4.1 Write read-only schema, count, relationship, orphan, notification, constant, and attachment checks in `data-inventory-checklist.md`.
- [x] 4.2 Define anonymization rules and prohibit production records, credentials, dumps, filenames, and attachments in Git.
- [x] 4.3 Define the aggregate-only result recording format.

## 5. Define Retention And Follow-Up Scope

- [x] 5.1 Write the exact retained customization list for #3 and #4 in `retained-customizations.md`.
- [x] 5.2 Separate retain, relocate, drop, and upstream-verification candidates.
- [x] 5.3 Record Known / Assumptions / Unknowns / Decisions Required with owners and verification steps in `known-unknowns.md`.

## 6. Validate The Inventory Change

- [x] 6.1 Re-run the reference searches for Forum/con4gis classes, packages, tables, modules, notification types, and templates.
- [x] 6.2 Confirm the submodule revisions against `git submodule status` / `.gitmodules` and the lock references.
- [x] 6.3 Validate this change with `openspec validate issue-1-inventory-forum-usage-custom-fork-behavi --type change --strict --json --no-interactive`.

## 7. Operator And Owner Follow-Up (Not Performed Here)

- [ ] 7.1 Fetch upstream `v5.0.6` in an authorized environment and complete the per-commit upstream classification (U1).
- [ ] 7.2 Run the anonymized-data checks and record aggregate results (U2–U4, U7).
- [ ] 7.3 Confirm production use of the custom PN endpoints and legacy Core uploader (U5, U6).
- [ ] 7.4 Decide D1–D10 and record them in the #3/#4 follow-up changes.
- [ ] 7.5 Re-validate the port against a restored/anonymized database before any production cutover.
