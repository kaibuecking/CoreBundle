# Operator Runbook: Forum 5.x Port, Notification Center And Data Checks

Owner: operator + backend maintainer. This runbook executes decisions D5, D7 and the operator tasks
7.2/7.3/7.5. Nothing in it runs as part of this documentation change.

## Preconditions

- The Forum 5.x port is merged and deployed to **staging** first.
- Staging has a **restored/anonymized** copy of the production database (needed by 7.2 and 7.5).
- A maintenance window is agreed for production; no cutover happens inside the port release.

## Version boundary (checked against upstream 2026-10-27)

| Package | Deployed today | Target | Evidence |
| --- | --- | --- | --- |
| `contao/core-bundle` | `4.13.58` | `^5.3` | Forum `v5.0.6` and Groups `v2.10.x` require `^5.3` |
| `con4gis/core` | `v7.1.7` (fork) | `^8` | Forum `v5.0.6`, Groups `v2.10.x`, Projects `v5.0.43` |
| `con4gis/forum` | `customfeaturesV2` `490a475` | narrow fork on `v5.0.6` | Decision D1 |
| `con4gis/projects` | `v4.0.41` | `^5` (`v5.0.43`) | Projects `composer.json` supports `^4.13 \|\| ^5.3` with core `^8` |
| `con4gis/groups` | `v2.8.6` | `^2.10` (`v2.10.2`) | Groups `composer.json` requires Contao `^5.3` |
| `terminal42/notification_center` | `1.6.18` | `^2` | Projects `v5.0.43` requires NC `^2.0` |

This is a **Contao 4.13 → 5.3 and NC 1 → 2 migration**, not a bundle bump. Plan it as its own
maintenance item after the port is production-ready.

## Steps (staging first, then production)

1. Record counts before touching anything: threads, posts, PN rows, subscriptions, members,
   `tl_nc_*` rows.
2. Take a database and files snapshot; confirm the restore path works.
3. Upgrade packages to the boundary above, then run `contao:migrate` and clear the application cache.
4. Notification Center 1 → 2: verify the email gateway, then reconcile the NC types the forum uses:
   `MailNewPmNotificationType` (PN) and the six subscription types. NC 2 changes gateway/type schema,
   so existing rows must be checked, not assumed.
5. Configure exactly **one** PN notification path (D5): activate the NC `mail_new_pm` type and
   suppress the legacy `notifyRecipient` mail in the same release.
6. Run the smoke tests below; only then plan the production window.

## Smoke tests

| Area | Test | Expected |
| --- | --- | --- |
| PN mail (D5) | Send one PM | Exactly **one** notification email |
| PN badge (D2) | Log in with an unread PM | Badge count matches `getMessageCount` |
| PN service (D2) | `contact`, `messages`, `markAll` via the app route | Correct JSON, no 4xx |
| First post (D3) | Open a thread | First post stays pinned, delete button hidden for it |
| Presentation (D4) | Thread view, delete dialog, PN compose | Labels from the app language files, no fork text |
| Uploader (D6) | Upload an image in the editor | Works without the legacy Core patch; report a missing close icon instead of patching |
| Notification types (D7) | Trigger a subscription notification | One notification, no duplicate |

## Data checks (7.2) and cutover (7.5)

- Run the anonymized-data checks on the restored copy: orphaned posts, missing `tl_member` rows in
  subscriptions, avatar/upload paths, PN rows without recipients. Record aggregates, not raw data.
- Re-validate the port against that copy; a green staging run on the restored data is the precondition
  for the production cutover.

## Production use checks (7.3)

- Confirm from access logs whether the custom PN endpoints and the legacy Core uploader are still
  called. If they are not, the corresponding decisions (D2 app route, D6 drop) are confirmed in
  practice; if they are, revisit before removing the old paths.

## Rollback

- Restore the database snapshot and the previous release together.
- Re-enable the legacy PN mail together with the code rollback; never leave both paths active.
