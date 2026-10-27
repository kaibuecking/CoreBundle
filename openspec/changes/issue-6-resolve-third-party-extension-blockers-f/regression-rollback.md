# Regression And Rollback Plan

## 1. Test Strategy

There is no application test suite for these bundled features. Coverage is therefore:

- **Automated:** Composer validation/resolution, image build, `openspec validate`, and the existing
  Contao/console smoke commands that run in CI.
- **Documented manual:** staging checks against a restored/anonymized database for every retained
  feature below.
- **Targeted per bridge:** only the affected feature is re-tested after each 4.13 bridge upgrade.

Every retained feature has at least one named check. Checks that need production-like data are marked
`manual/staging` and must not use production records in Git.

## 2. Retained Feature Regression Matrix

| Feature | Package | Coverage | Check | Expected |
| --- | --- | --- | --- | --- |
| Scheduler and seven custom jobs | `bugbuster/contao-cron-bundle` | manual/staging | Run each job once; inspect cron log and side effects | Job runs once, no duplicate mails/cleanup, log entry present |
| Voucher generation and admin mail | cron job + `SensiqueMailHandler` | manual/staging | Trigger voucher job in staging | ZIP generated and admin mail delivered |
| Subscription cleanup | cron job + Forum tables | manual/staging | Run against restored copy with known orphans | Only orphaned subscriptions removed; valid rows remain |
| Font Awesome inserttags | `netzmacht/contao-font-awesome-inserttag` | manual/staging | Render navigation, login, glossary, member pages | Every `{{fa::...}}` and `fa fa-*` icon renders |
| Leads (if retained) | `terminal42/contao-leads` | manual/staging | Submit a form; export a lead | Form data stored and export works |
| Leads removal (preferred) | `terminal42/contao-leads` | manual/staging | Verify zero `tl_lead*` data before removal | No data loss; no broken form setting |
| NC PN notification | `terminal42/notification_center` | manual/staging | Send one PM | Exactly one notification e-mail |
| NC subscription notifications | `terminal42/notification_center` | manual/staging | Trigger each subscription type | One notification per event; tokens resolve |
| NC module wiring | NC + Forum | manual/staging | Check every `sub_*`/`mail_new_pm` ID | Every configured ID resolves |
| Certificate upload | `terminal42/contao-fineuploader` | manual/staging | Upload PDF in registration/profile/admin | File stored, linked, and visible |
| Avatar upload | `terminal42/contao-fineuploader` | manual/staging | Upload avatar in profile | Image stored and rendered |
| Fineuploader template override | Fineuploader | manual/staging | Open member edit/registration | Widget renders, errors clear, no JS exception |
| RockSolid antispam | `madeyourday/contao-rocksolid-antispam` | manual/staging | Submit legitimate and spam form | Legitimate accepted; spam blocked |
| RockSolid columns | `madeyourday/contao-rocksolid-columns` | manual/staging | Render pages with column elements | Layout unchanged |
| RockSolid slider | `madeyourday/contao-rocksolid-slider` | manual/staging | Render pages with sliders | Slides, navigation, and styles work |
| ALTCHA challenge | `markocupic/contao-altcha-antspam` | manual/staging | Render form; solve valid/expired challenge | Valid accepted; invalid/expired rejected |
| Novalnet payment | application-owned | manual/staging | Sandbox session, redirect, webhook, refund | Correct status and persisted order |
| Novalnet subscription | application-owned + cron | manual/staging | Sandbox subscription/renewal | Subscription state and notification correct |
| PHPMailer delivery | `phpmailer/phpmailer` | manual/staging | Send representative mails | Delivered with correct recipient/subject |
| TCPDF invoice | `tecnickcom/tcpdf` | manual/staging | Generate invoice PDF | Valid PDF, correct fonts/layout |
| TCPDF voucher | `tecnickcom/tcpdf` | manual/staging | Generate voucher ZIP/PDF | Valid PDF and ZIP |
| Frontend components | `components/*` | manual/staging | Load a representative page | jQuery, jQuery UI, Font Awesome load once |
| Kartik fileinput asset | checked-in `files/kartik-v` | manual/staging | Open avatar/certificate widget | Fileinput UI works from the checked-in path |
| Forum features | con4gis boundary | manual/staging | Use the #1 smoke matrix | Forum, PN, subscriptions, first post, uploads |
| Contao 5 platform | #8 | manual/staging | Full smoke suite after `contao:migrate` | Login, pages, forms, mail, cron, files |

## 3. Bridge Regression

After each approved 4.13 bridge:

1. Run `composer validate --no-check-publish` in `contao/`.
2. Rebuild the image from the updated lock.
3. Run the specific row(s) in the matrix.
4. Confirm no unrelated package version changed (`composer show --locked` diff).
5. If the check fails, revert `contao/composer.json` and `contao/composer.lock` together; no database
   migration is expected for these patch/minor bridges.

| Bridge | Required checks |
| --- | --- |
| Fineuploader `3.5.4` → `3.5.5` | Certificate upload, avatar upload, template override, stored file |
| Font Awesome Inserttag `2.2.0` → `2.2.1` | All inserttag variants, direct `fa fa-*` icons, CSS load |
| RockSolid antispam `v2.1.2` → `v2.1.3` | Legitimate submit, spam block, form settings |
| RockSolid slider `v2.2.9` → `v2.2.10` | Slider content rendering |
| Altcha `0.6.9` → `0.7.3` | Config keys, challenge render, valid/invalid solve |

## 4. Rollback Plan

### All Changes

- Take a database dump and a files snapshot before any upgrade or migration; verify the restore path.
- Record the current image tag/digest and the exact `contao/composer.lock` hash.
- Keep the previous image available for redeployment.
- Roll back code and data together; never restore code without the matching database state.

### Bridge Upgrades

- Revert `contao/composer.json`, `contao/composer.lock`, and any template adjustment in one commit.
- Rebuild/redeploy the previous image.
- No schema or data migration is expected for these bridges. If a bridge unexpectedly writes data,
  restore the pre-bridge snapshot.
- Re-run the affected matrix row after rollback.

### #8 Final Upgrade

- Roll back to the previous image and the pre-#8 database/files snapshot.
- If NC 1 → 2 ran, restore the NC tables together with the code; do not leave NC 2 code with NC 1 data
  or vice versa.
- If Leads was removed, restore the exported/archived data and the previous package set together.
- If the con4gis/forum fork is reverted, restore the previous submodule pointers and Dockerfile/compose
  mounts together.
- Re-run the full smoke suite on the restored state before reopening traffic.

### Rollback Triggers

- Image build or Composer resolution fails.
- Any retained-feature check fails and cannot be fixed in the same change.
- Cron jobs run twice or delete valid rows.
- Notification Center sends zero or duplicate notifications.
- Uploads fail, are lost, or cannot be resolved from `tl_files`.
- Payment/webhook state is inconsistent or orders are duplicated.
- PDF or mail delivery regresses.

## 5. Exit Criteria

- Every retained feature above has a passing manual/staging result or a documented accepted risk.
- Every bridge upgrade has a passing targeted check and a clean lock diff.
- NC 1 → 2 has a passing single-notification test and resolved module IDs.
- Leads has either zero data with an approved removal or an archived dataset with a recorded fallback.
- #8 has the exact manifest/build/data prerequisites from `issue-8-handoff.md`.
- No production data, credentials, dumps, or attachments entered the repository.
