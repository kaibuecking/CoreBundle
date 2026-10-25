# Known, Assumptions, Unknowns, Decisions Required

## Known

- The deployed application revision is `b6ff330b66c37349c299028138433c2a764e2bde`.
- `packages/forum` is pinned to `490a475baacc4610e10d3e77daa96acf182b50ca` (`dev-customfeaturesV2`).
- `packages/core` is pinned to `bf42aa097419568b3eedeb658616a74c6a7a7194` (`dev-customfeaturesV2`).
- The Forum fork has 11 non-merge commits beyond its `main`; the Core fork has 3.
- Upstream `v5.0.6` is not present locally; local Forum tags end at `v3.10.7`; no upstream remote is configured; no vendor tree is available.
- The application depends directly on `tl_c4g_forum_pn`, `tl_c4g_forum_thread`, `tl_c4g_forum_post`, `tl_c4g_forum_thread_subscription`, `C4GForumHelper`, `C4gForumSession`, `C4gForumPn`, and `ForumController::getMessageCount`.
- The private chat depends on the custom `/con4gis/forumPnService/...` actions.
- Notification Center 1.6.18 is installed transitively; the Forum bundle registers seven `con4gis Forum` notification types.
- The application lock contains both `kaibuecking/core` and `con4gis/core` v7.1.7; the Dockerfile deletes `vendor/con4gis/core`.
- The application already owns Forum presentation overrides (`forum_user_data.html5`, `mod_c4g_forum.html5`, `forum.css`, `forum.js`) and member/navigation templates.
- The application contains hard-coded forum category IDs, thread IDs, sender ID, and PN subjects.
- No production data, attachment files, credentials, or personal information were read or copied into this change.

## Assumptions

| ID | Assumption | Impact if wrong | Verification |
| --- | --- | --- | --- |
| A1 | Upstream `con4gis/forum` `v5.0.6` is the intended migration base named in the approved direction. | Wrong base invalidates the delta matrix. | Backend maintainer confirms the tag in an authorized upstream checkout. |
| A2 | The private chat and custom PN endpoints are required production behavior. | Removing them breaks SensIQue messaging. | Product owner confirms chat usage; operator checks PN counts and recent activity. |
| A3 | Category IDs `1`, `5`–`18`, threads `86`/`87`, member `818`, and group `6` are stable production data. | Navigation, welcome messages, or permissions break. | Operator runs the ID checks in `data-inventory-checklist.md` against anonymized data. |
| A4 | The `DELETED_USER` key mismatch introduced in `490a475` is a defect, not desired behavior. | Deleted-user labels may be missing or wrong. | Compare app template reads (`DISCUSSION`) with fork language data; render a deleted-author thread. |
| A5 | Disabling `C4gForumPn::send()`'s legacy notifier was intentional to avoid duplicate e-mails with the NC `mail_new_pm` path. | PMs may silently stop e-mailing or may double-send. | Send a test PM and count NC messages/e-mails in staging. |
| A6 | The legacy Core `imgUpload.php` and `DialogHandler.js` changes may no longer be used by the current editor. | Unnecessary fork surface, or lost upload/UI behavior if still used. | Operator verifies editor upload usage and endpoint traffic; backend maintainer checks asset references. |
| A7 | Forum uploads live under module-configured folders and/or `files/uploads/images`, while avatars live under `files/userimages/user_<id>`. | Attachments or avatars are missed in migration. | Run attachment/avatar checks and compare `tl_files` with filesystem counts. |

## Unknowns

| ID | Unknown | Owner | Operator-safe verification | Blocking? |
| --- | --- | --- | --- | --- |
| U1 | What upstream `v5.0.6` already contains: which of the 11 Forum and 3 Core commits are upstreamed, obsolete, or still needed. | Backend maintainer | Authorized upstream checkout; follow the `delta-matrix.md` comparison procedure. Record per-commit evidence, not guesses. | Yes, for final classification |
| U2 | Actual production table counts, relationships, and orphan counts. | Operator/DBA | Run `data-inventory-checklist.md` sections 1–4 against anonymized data. Record aggregates. | Yes, for data scope |
| U3 | Actual Notification Center rows, languages, gateways, and forum-module wiring. | Operator + product owner | Run section 5 and the read-only unresolved-ID check. Record counts/booleans. | Yes, for notification cutover |
| U4 | Actual attachment and avatar locations, counts, and whether legacy uploads are registered in `tl_files`. | Operator | Run section 7; compare counts, never filenames. | Yes, for attachment migration |
| U5 | Whether the custom PN endpoints are used in production and by which clients (web chat, apps, other integrations). | Product owner + backend maintainer | Check access logs for `/con4gis/forumPnService/`, PN row growth, and chat usage; no content inspection. | Yes, for #3 API decision |
| U6 | Whether legacy Core `imgUpload.php` and the `DialogHandler.js` close icon are still in use. | Backend maintainer | Search application/asset references and endpoint traffic in staging; inspect editor configuration. | No, but affects Core scope |
| U7 | Whether Notification Center e-mails are currently delivered or deliberately inactive. | Operator + product owner | Check NC gateway configuration, cron/queue behavior, and test delivery in staging. | Yes, for notification activation |
| U8 | Whether Forum table names/schema change in `v5.0.6` and require a data migration. | Backend maintainer | Compare upstream DCA/schema files with the deployed schema; run the port against a restored copy. | Yes, for data migration |
| U9 | Whether all historical categories, threads, subscriptions, and PNs must be retained. | Product owner | Review aggregate counts and retention policy; approve a cutoff/archival rule. | Yes, for data scope |
| U10 | Whether group `6` and forum member/admin group assignments remain the authorization model. | Product owner | Review anonymized group counts and forum group fields; validate permissions in staging. | No, but affects permissions |
| U11 | Exact upstream Core version that `v5.0.6` requires. | Backend maintainer | Inspect upstream composer metadata; compare with `con4gis/core` v7.1.7 and the Core fork. | Yes, for Core delta |

## Decisions Required

| ID | Decision | Owner | Recommended default | Verification |
| --- | --- | --- | --- | --- |
| D1 | Fork strategy and package naming: narrow `kaibuecking/forum` fork on upstream 5.x, and how to resolve the `kaibuecking/core` vs `con4gis/core` duplication. | Backend maintainer + product owner | Keep one narrow Forum fork; adopt upstream Core requirement; move only proven Core fixes to an application patch or upstream; remove the Dockerfile deletion workaround. | Composer resolves one Core package; image builds; forum boots. |
| D2 | Where the custom PN service lives: narrow fork or application-owned controller. | Backend maintainer | Prefer application-owned controller/module if it can use public Forum models; otherwise keep a minimal fork controller. | Private chat and login badge work in staging. |
| D3 | Where first-post-pinned behavior lives: fork query/renderer or application-level extension. | Backend maintainer | Keep in fork if upstream query structure is stable; otherwise implement as an application plugin/override. | Thread ordering and delete-button behavior verified. |
| D4 | Presentation ownership: language strings, template partial, CSS. | Frontend maintainer + backend maintainer | Application-owned overrides; fork carries logic only. | Visual regression check; fork diff contains no presentation files. |
| D5 | Notification path: legacy PN e-mail, NC `mail_new_pm`, or both. | Product owner + operator | One NC path; disable legacy to avoid duplicates. | Send test PM; exactly one notification. |
| D6 | Legacy Core uploader and dialog close-icon changes: retain, relocate, or drop. | Backend maintainer | Relocate only if still used; otherwise drop. | Upload flow tested; no broken editor dialog. |
| D7 | Notification Center migration ownership and activation timing. | Operator + product owner | Operator-owned migration after code port; no activation in this change. | NC rows resolve; staging e-mail test. |
| D8 | Data retention and migration scope: all history, cutoff, or archive. | Product owner + operator | Retain all threads/posts/subscriptions unless policy says otherwise; archive orphaned rows only after review. | Counts and retention decision recorded. |
| D9 | `DELETED_USER` language key: keep `DISCUSSION` (app compatibility) or migrate app to the new key. | Backend maintainer | Keep/restore `DISCUSSION` unless upstream 5.x standardizes a different key; update app consistently. | Deleted-author render test. |
| D10 | Permission model: keep forum/member groups or replace. | Product owner | Keep existing group model for the port; redesign separately. | Permission matrix tested in staging. |

## Follow-up Exit Criteria

The unknowns are sufficiently resolved for #3/#4 when:

- U1 has an evidence-based per-commit upstream classification.
- U2–U4 and U7 have aggregate results recorded outside Git.
- U5 and U9 are confirmed by the product owner.
- D1–D5 and D8 are decided and recorded in the follow-up change.
- No production data, credentials, or attachment files have entered the repository.
