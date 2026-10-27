# Extension Compatibility Matrix

Evidence date: **2026-10-27**. Current versions and constraints are from `contao/composer.lock`; candidate versions are from read-only `composer show -a <package> <version>`. The application baseline is `b6ff330b66c37349c299028138433c2a764e2bde`. No package was installed, updated, or edited.

## 1. Direct Blocking Extensions

| Package | Locked today | Current core constraint | Observed application use | Data/config/template footprint | Contao 5 blocker | Disposition | 4.13 bridge | #8 target | Target constraint evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `bugbuster/contao-cron-bundle` | `1.5.7` | `>=4.9.0,<5.0` | Seven legacy jobs in `system/modules/cron/jobs/`; scheduler route `bbcron/startjobs` in `cron/{dev,prod}/crontab`; `contao:cron` already runs separately | Job scripts use `system/initialize.php`, `Backend`, `$cronJob`, `TL_ROOT`; cron/log records | Yes | Keep and upgrade | None; `1.6.x` requires Contao `^5.2`, `1.7.x` requires `>=5.4`/`>=5.6` | `^1.7.3` | `1.7.3`: PHP `^8.3`, core `>=5.6.0,<5.8.0`, Symfony `^6.4 || ^7.0` |
| `netzmacht/contao-font-awesome-inserttag` | `2.2.0` | `^4.9` | `{{fa::book 2x}}`, `{{fa::search}}`, `{{fa::pencil}}`, `{{fa::square-o}}`, `{{fa::square}}`, `{{fa::arrow-up 2x}}`; `fa fa-*` classes in member, login, glossary, forum, and payment templates | `templates/fe_page.html5` loads `/assets/font-awesome/css/font-awesome.min.css`; no persisted data | Yes | Keep and upgrade | `2.2.1` supports `^4.9 || ^5.0` | `^2.2.3` | `2.2.3`: PHP `^8.2`, core `^5.3`, Symfony `^6.4 || ^7.4`; `2.2.2` already requires core `^5.3` |
| `terminal42/contao-leads` | `1.4.33` | `^3.5.1 || ^4.1` | No application code, template, DCA, or configuration reference found; direct Composer requirement only | Possible `tl_lead*` tables, form settings, and exported files; unverified without a database | Yes | Remove, data-gated | None; `3.x` requires Contao `^5.7` | Remove; fallback `^3.4.1` only if active use is confirmed | `3.4.1`: PHP `^8.3`, core `^5.7`, Haste `^5.0`, PhpSpreadsheet `^3.4 || ^4.0 || ^5.0`, Symfony `^7.4` |
| `terminal42/notification_center` | `1.6.18` | `~4.4` | No direct application reference; used through `con4gis/projects` and Forum `C4GForumNotification`; seven `con4gis Forum` types and `mail_new_pm` | `tl_nc_notification`, `tl_nc_message`, `tl_nc_language`, `tl_nc_gateway`, `tl_nc_registration`; module notification IDs | Yes | Keep and migrate | Not approved; Projects `v4.0.41` requires NC `^1.6` and the deployed Forum fork runs on that line | `^2` (`2.7.8`) | `2.7.8`: PHP `^8.3`, core `^5.3.14 || ^5.4.4`, Haste `^5.2`, Doctrine ORM `^2.19 || ^3.0` |
| `terminal42/contao-fineuploader` | `3.5.4` | `^4.13 || ^5.0` | `tl_member.xt_zertifikat` uses `inputType=fineUploader`; `memberImage` avatar upload; templates `fineuploader_frontend.html5`, `member_register`, `member_edit`, `member_view`, `member_grouped`, `my_profile` | Uploads to `files/zertifikate_hochbegabung` and member home directories; `tl_member`, `tl_files`, filesystem files | No | Keep and upgrade | `3.5.5` explicitly supports `^4.13 || ^5.0` | `^3.5.5` | `3.5.5`: PHP `^7.4 || ^8.0`, core `^4.13 || ^5.0`, Symfony Filesystem `^5.4 || ^6.4 || ^7.4` |
| `madeyourday/contao-rocksolid-antispam` | `v2.1.2` | `^4.13 || ^5.0` | No source/template/DCA reference found; form protection is data/config-driven | `tl_form`/module anti-spam settings; no dedicated schema assumed | No | Keep and upgrade | `v2.1.3` supports `^4.13 || ^5.0 || ^6.0` | `^2.1.3` | `v2.1.3`: PHP `>=7.4`, core `^4.13 || ^5.0 || ^6.0` |
| `madeyourday/contao-rocksolid-columns` | `v2.1.2` | `^4.13 || ^5.0` | No source/template/DCA reference found; content elements are database-driven | `tl_content` rows of RockSolid column types; templates may be stored in the theme | No | Keep and upgrade | None; `v2.1.3` requires core `^5.3 || ^6.0` | `^2.1.3` | `v2.1.3`: PHP `>=7.4`, core `^5.3 || ^6.0` |
| `madeyourday/contao-rocksolid-slider` | `v2.2.9` | `^4.13 || ^5.0` | No source/template/DCA reference found; content elements are database-driven | `tl_content` slider rows; theme templates/CSS | No | Keep and upgrade | `v2.2.10` supports `^4.13 || ^5.0` | `^2.2.11` | `v2.2.11`: PHP `>=7.4`, core `^5.3 || ^6.0`, Doctrine DBAL `^3.3 || ^4.0` |
| `markocupic/contao-altcha-antispam` | `0.6.9` | `^4.13 || ^5.0` | Configured in `config/config.yaml` with `algorithm`, `range_min`, `range_max`, `challenge_expiry`; form integration is bundle-managed | `tl_form`/form widgets and challenge data; config keys in `contao/config/config.yaml` | No | Keep and upgrade | `0.7.3` supports `^4.13 || ^5.0`; verify config keys and challenge markup | `^0.8.0` | `0.8.0`: PHP `^8.1`, core `^5.3 || ^6.0`, Symfony `^6.4 || ^7.4 || ^8.0`, Doctrine DBAL |

## 2. con4gis And Fork Boundary

These packages are covered by the Forum inventory (#1) and the recorded decisions D1–D10; they are repeated here because they are prerequisites for #8.

| Package | Locked today | Observed use | Disposition | #8 target | Constraint evidence |
| --- | --- | --- | --- | --- | --- |
| `kaibuecking/core` | `dev-customfeaturesV2` `bf42aa09` | Forked Core; public assets symlinked in `Dockerfile`; `con4gis/core` is deleted from vendor | Remove (D1) | Replaced by upstream `con4gis/core ^8` | Core fork has only package rename, two application hunks, and a two-line version guard |
| `kaibuecking/forum` | `dev-customfeaturesV2` `490a475b` | Deployed Forum fork; 11 custom commits | Replace with narrow fork on upstream `v5.0.6` (D1/D3) | `con4gis/forum` narrow fork based on `v5.0.6` | Upstream `v5.0.6` requires PHP `^8.0`, core `^5.3`, `con4gis/core ^8`, groups `^2.10`, projects `^5` |
| `con4gis/core` | `v7.1.7` | Transitive through Groups/Projects; deleted by `Dockerfile` | Upgrade | `^8` | `8.0.0`: PHP `^8.1`, core `^4.13 || ^5.3` |
| `con4gis/projects` | `v4.0.41` | Notification base class and jQuery GUI used by Forum | Upgrade | `^5` (`v5.0.43`) | `v5.0.43`: PHP `^8.1`, core `^4.13 || ^5.3`, core `^8.0`, NC `^2.0`, jQuery components `^3.7` |
| `con4gis/groups` | `v2.8.6` | Forum member/group model | Upgrade | `^2.10` (`v2.10.2`) | `v2.10.2`: PHP `^8.1`, core `^5.3`, core `^8.0`, projects `^5.0` |
| `terminal42/notification_center` | `1.6.18` | Forum notification types and PM | Migrate | `^2` (`2.7.8`) | NC 1 → 2 is a migration, not a bump; see D7 |

## 3. Non-Blocking Application Dependencies

| Package | Locked today | Use | Disposition | Notes |
| --- | --- | --- | --- | --- |
| `phpmailer/phpmailer` | `v6.12.0` | Direct SMTP mail in `SensiqueMailHandler` and modules | Keep | No Contao coupling; requires PHP `>=5.5`. Hardcoded SMTP credentials must move out of source as a separate security task. |
| `tecnickcom/tcpdf` | `6.11.3` | `SensiquePDF`, invoices, vouchers | Keep | Requires PHP `>=7.1`; no Contao coupling. Regression: invoice/voucher PDF rendering and fonts. |
| Novalnet client (application-owned) | `system/modules/sensiquemodule/api/novalnet` | Payment sessions, webhooks, subscriptions, refunds | Keep | No Composer package; uses `curl`. Regression: sandbox payment, webhook processing, subscription cron. |
| PayPal legacy enum | `PaymentType::PAYPAL` | Membership status logic only | Keep as data enum | No PayPal SDK or Composer package; no extension blocker. |
| `components/font-awesome` | `4.7.0` | `/assets/font-awesome/css/font-awesome.min.css`; inserttag icons | Keep | Application-owned frontend asset; Dockerfile moves it from `vendor/components/font-awesome`. |
| `components/jquery` | `3.6.0` | `/assets/jquery/jquery.min.js` | Keep | Application-owned; Contao 5 also ships `contao-components/jquery`, but templates load the app path. |
| `components/jqueryui` | `1.12.1` | `/assets/jquery-ui/jquery-ui.min.js` and base theme CSS | Keep | Application-owned; verify no duplicate Contao 5 jQuery UI assets. |
| `kartik-v/bootstrap-fileinput` | `dev-master` (`5.5.x-dev`) | Templates load `files/kartik-v/bootstrap-fileinput/...` for avatar/certificate upload | Remove Composer requirement; keep the checked-in asset | The runtime path is the committed `files/kartik-v` copy. Pinning/removing the unpinned dev dependency removes drift without losing the feature. |
| `curl/curl` | `2.5.0` | PHP cURL library used by the application and Novalnet client | Keep | Requires `ext-curl` and PHP `^5.6 || ^7.0 || ^8.0`; no Contao coupling and no blocker. The Docker image must keep `ext-curl`. |
| `oomphinc/composer-installers-extender` | `2.0.0` | Installs `components/*` packages | Keep while `components/*` remain | Do not remove before the frontend asset strategy is settled. |
| `contao/conflicts` | `dev-main` | Contao metapackage; no runtime code | Keep or replace with the Contao 5 skeleton equivalent | Metapackage only; confirm the Contao 5 skeleton still requires it. Not an extension blocker. |
| `contao-community-alliance/composer-plugin` | Locked transitively | Required by NC 1 and Leads 1 | Remove with NC 1/Leads 1 | NC 2 and Leads 3 no longer need it. |
| `codefog/contao-haste` | `4.25.31` | Transitive through NC/Leads | Let target packages resolve | NC 2 requires Haste `^5.2`; Leads 3 requires `^5.0`; both support Contao 4.13/5.x. |
| `menatwork/contao-multicolumnwizard(-bundle)` | Locked transitively | Used by Leads 1 and Projects 5 | Let target packages resolve | Projects `v5.0.43` requires the bundle `^3.6`; verify at #8. |

## 4. Current Resolver Blockers

Command run in `contao/`:

```bash
composer prohibits contao/core-bundle 5.7.15 --locked --no-interaction
```

The command reported these package-side blockers (17 lines):

- `bugbuster/contao-cron-bundle 1.5.7` → `>=4.9.0,<5.0`
- `codefog/contao-haste 4.25.31` → `^4.4`
- `con4gis/groups v2.8.6` → `^4.9`
- `con4gis/projects v4.0.41` → `^4.9`
- `contao/calendar-bundle`, `comments-bundle`, `faq-bundle`, `installation-bundle`, `listing-bundle`, `manager-bundle`, `news-bundle`, `newsletter-bundle` `4.13.58` → `self.version`
- `kaibuecking/core dev-customfeaturesV2` → `^4.9`
- `kaibuecking/forum dev-customfeaturesV2` → `^4.9`
- `netzmacht/contao-font-awesome-inserttag 2.2.0` → `^4.9`
- `terminal42/contao-leads 1.4.33` → `^3.5.1 || ^4.1`
- `terminal42/notification_center 1.6.18` → `~4.4`

Every blocker has a target or an approved removal/replacement path in sections 1–3. The remaining `contao/*` bundle lines disappear with the Contao 5 bundle set in #8.

The command also reported local CLI platform gaps (`ext-intl`, `ext-pdo`, `ext-session` missing) and Symfony/Doctrine major mismatches. These are environment/upgrade-sweep findings, not extension blockers, and are resolved by the #8 dependency sweep.

## 5. Bridge Candidates (Contao 4.13)

Only these upgrades are approved before #8:

| Package | From | To | Why supported on 4.13 | Regression |
| --- | --- | --- | --- | --- |
| `terminal42/contao-fineuploader` | `3.5.4` | `3.5.5` | Target declares `^4.13 || ^5.0` | Certificate/avatar upload, persisted file, thumbnail |
| `netzmacht/contao-font-awesome-inserttag` | `2.2.0` | `2.2.1` | Target declares `^4.9 || ^5.0` | Render each inserttag and direct `fa fa-*` icon |
| `madeyourday/contao-rocksolid-antispam` | `v2.1.2` | `v2.1.3` | Target declares `^4.13 || ^5.0 || ^6.0` | Legitimate form submit and blocked spam submit |
| `madeyourday/contao-rocksolid-slider` | `v2.2.9` | `v2.2.10` | Target declares `^4.13 || ^5.0` | Render each slider content element |
| `markocupic/contao-altcha-antispam` | `0.6.9` | `0.7.3` | Target declares `^4.13 || ^5.0` | Challenge render, valid solve, expired/failed challenge |

No bridge is approved for:

- `bugbuster/contao-cron-bundle` — `1.6.x` needs Contao `^5.2`.
- `netzmacht/contao-font-awesome-inserttag` `2.2.3` — needs Contao `^5.3`.
- `terminal42/contao-leads` `3.x` — needs Contao `^5.7`.
- `terminal42/notification_center` `2.x` — blocked by Projects 4/Forum fork on NC 1.
- `con4gis/core`, `con4gis/projects`, `con4gis/groups`, Forum — all cross the Contao 5 boundary or require each other in a 5.x set.

## 6. Evidence Gaps And Operator Checks

No database, staging instance, or production data was available. The following are not code-provable and must be checked read-only before bridge/removal or #8:

| Check | Why it matters | Owner | Where |
| --- | --- | --- | --- |
| `tl_lead*` tables and row counts | Decides Leads removal vs export vs fallback upgrade | Operator/DBA | `operator-checks.md` |
| `tl_content` RockSolid types | Proves columns/slider content exists | Operator | `operator-checks.md` |
| `tl_form` RockSolid/ALTCHA settings | Proves antispam/Altcha protection is active | Operator | `operator-checks.md` |
| `tl_nc_*` rows and module IDs | Required for NC 1 → 2 migration | Operator | `operator-checks.md` |
| `tl_member.xt_zertifikat`/`memberImage` and `tl_files` | Proves Fineuploader data and paths | Operator | `operator-checks.md` |
| `tl_cron_job`/cron logs | Proves which custom jobs run and when | Operator | `operator-checks.md` |
| Upstream release notes | Confirms behavioural changes not visible in Composer metadata | Backend maintainer | Authorized upstream checkout |
| Staging with restored/anonymized database | Required for bridge regression and #8 cutover | Operator | Staging environment |
