# Data, Configuration, Template, And Build Migration Notes

All notes are prerequisites or follow-up steps. Nothing here is executed by this analysis change.

## 1. General Composer And Build Rules

- `contao/composer.lock` is authoritative until a deliberately approved update. Do not run a global `composer update`.
- Apply bridge upgrades in `contao/` only, then commit `contao/composer.json` and `contao/composer.lock` together.
- Do not edit `vendor/` or add `config.platform` overrides to hide PHP/Symfony mismatches.
- Build the image from the updated lock and run `composer validate --no-check-publish` plus the targeted feature checks.
- #8 updates the Contao bundle set, the con4gis set, NC, cron, Font Awesome Inserttag, RockSolid, Altcha, and the Leads removal in one controlled branch.

## 2. Cron Bundle And Custom Jobs

**Today**

- `bugbuster/contao-cron-bundle` `1.5.7` is the scheduler.
- `cron/{dev,prod}/crontab` calls `https://<host>/bbcron/startjobs` every minute and `contao:cron` separately.
- `system/modules/cron/jobs/` contains seven legacy scripts:
  `PurgeLog.php`, `createVouchersCron.php`, `deleteTerminatedMembershipsCron.php`,
  `deleteUnpayedMembershipsCron.php`, `deleteUnreferencedSubscriptions.php`,
  `sendPaymentPrenotifaction.php`, `updateUserMembershipsCron.php`.
- The scripts bootstrap `system/initialize.php`, extend `Backend`, read the global `$cronJob`,
  and use `TL_ROOT`.

**Required migration (Contao 5)**

- Rewrite each job as a Contao 5 cron service (the application already uses
  `#[AsCronJob('minutely')]` in `src/Cron/`) or the job mechanism provided by cron bundle `1.7.3`.
- Remove dependence on `system/initialize.php`, legacy `Backend`, `TL_ROOT`, and `$cronJob`.
- Keep the schedules and idempotency of the current jobs:
  log purge, voucher ZIP generation/mail, terminated/unpaid membership cleanup, unreferenced forum
  subscription cleanup, payment pre-notification, user membership update.
- Decide whether `bbcron/startjobs` remains after `1.7.3`; the `contao:cron` line already exists and
  should become the only runner if the bundle's scheduler UI is not required.
- Audit the non-bundle cron entries separately: `system/modules/sensiquemodule/ZipSensiqueInvoice.php`
  and the backup scripts are not provided by the cron bundle but run on the same host.
- Cron logs and the bundle's job state are operational data, not content; preserve/verify them in staging.

**Regression**

- Trigger each job in staging or a restored copy; verify one successful run, no duplicate side effects,
  and expected log/notification output.
- Verify the voucher ZIP job still reaches the admin mail path.
- Verify subscription cleanup does not delete rows whose members exist.

## 3. Font Awesome Inserttag And Frontend Icons

**Today**

- `netzmacht/contao-font-awesome-inserttag` `2.2.0`.
- Inserttags are used in `nav_default_bootstrap.html5`, `mod_glossary_menu.html5`,
  `mod_login.html5`, `mod_glossary_list.html5`, and `member_grouped.html5`.
- Direct `fa fa-*` markup is used in member, forum, login, and payment templates.
- `templates/fe_page.html5` loads `/assets/font-awesome/css/font-awesome.min.css`.
- The Dockerfile moves `vendor/components/font-awesome/fonts/*` and `css/` to `assets/font-awesome/`.

**Required migration**

- Bridge to `2.2.1` on 4.13; target `2.2.3` at #8.
- Keep the inserttag syntax unchanged (`{{fa::name size}}`).
- Keep the Font Awesome 4.7.0 application asset path unless a separate icon redesign is approved.
- Verify the `2.2.3` release does not require a different Font Awesome major or changed inserttag syntax;
  confirm from release notes in #8.
- No database migration.

## 4. Leads

**Today**

- `terminal42/contao-leads` `1.4.33` is a direct Composer requirement.
- No application code, template, DCA, or configuration reference was found.
- Possible data: `tl_lead*` tables, form settings, and exported files.

**Required migration**

- Run the read-only lead checks in `operator-checks.md` against a restored/anonymized database.
- If no lead data and no active export requirement exist: remove the Composer requirement, remove
  `contao-community-alliance/composer-plugin` if nothing else needs it, and drop/archive the empty tables
  only with owner approval.
- If lead data exists but the feature is retired: export/archive the data before removing the package.
- If active use exists: keep the feature and target `^3.4.1` at #8. That requires Contao `^5.7`,
  PHP `^8.3`, Haste `^5.0`, PhpSpreadsheet, and Symfony `^7.4`; plan the storage/export migration then.
- Do not delete lead data inside the package-removal change without an approved retention decision.

## 5. Notification Center 1 → 2

**Today**

- `terminal42/notification_center` `1.6.18`, required transitively by `con4gis/projects` `v4.0.41`.
- The deployed Forum fork registers seven `con4gis Forum` types:
  `sub_new_thread`, `sub_deleted_thread`, `sub_moved_thread`, `sub_new_post`,
  `sub_deleted_post`, `sub_edited_post`, `mail_new_pm`.
- Persisted tables: `tl_nc_notification`, `tl_nc_message`, `tl_nc_language`,
  `tl_nc_gateway`, `tl_nc_registration`.
- Module fields `sub_*`, `mail_new_pm`, and `new_pm_redirect` reference notification IDs.
- D5 requires exactly one PM notification path: NC `mail_new_pm`, with the legacy
  `notifyRecipient` mail suppressed in the same release.
- D7 makes migration and activation operator-owned, after the code port, in a maintenance window.

**Required migration**

- Do not bridge NC on 4.13. It moves with Projects 5/Forum 5 in #8.
- Record counts and IDs first; take a database snapshot.
- Reconcile NC types, messages, languages, gateways, and registrations after `contao:migrate`.
- Verify every configured module notification ID resolves.
- Verify the email gateway and German language rows.
- Send one test PM and one subscription notification; expect exactly one notification each.
- Roll back code and database together; never leave both legacy and NC PM paths active.

## 6. Fineuploader

**Today**

- `terminal42/contao-fineuploader` `3.5.4`.
- `tl_member.xt_zertifikat` uses `inputType=fineUploader`, PDF only, upload folder
  `files/zertifikate_hochbegabung`, and `useHomeDir=true`.
- `memberImage` is the avatar upload; templates override the frontend widget.
- Files are persisted under member home directories / the certificate folder and linked through
  `tl_files` where configured.

**Required migration**

- Bridge to `3.5.5` on 4.13; target `^3.5.5` at #8.
- Preserve the upload folder, allowed extension, size limits, chunking, and thumbnail settings.
- Verify the overridden `fineuploader_frontend.html5` template and the `ContaoFineUploaderFrontend`
  JavaScript contract in the target release.
- No schema change is expected for the patch. Verify `tl_member.xt_zertifikat`, `memberImage`,
  `tl_files`, and the filesystem counts before and after.
- Keep file permissions/ownership compatible with the web user.
- Apply D6 separately: remove only the Core fork's legacy vendor uploader (`imgUpload.php`,
  `DialogHandler.js`). That removal does not replace or retire `terminal42/contao-fineuploader`.

## 7. RockSolid Extensions

**Today**

- `madeyourday/contao-rocksolid-antispam` `v2.1.2`.
- `madeyourday/contao-rocksolid-columns` `v2.1.2`.
- `madeyourday/contao-rocksolid-slider` `v2.2.9`.
- No source/template/DCA reference was found. Usage is database-driven through content elements,
  form/module settings, and theme templates.

**Required migration**

- Antispam: bridge to `v2.1.3` on 4.13; keep `^2.1.3` at #8. Verify form protection is still configured
  in `tl_form`/module settings after the package update.
- Columns: stay on `v2.1.2` on 4.13; target `^2.1.3` at #8. `v2.1.3` requires Contao `^5.3`.
- Slider: bridge to `v2.2.10` on 4.13; target `^2.2.11` at #8. `v2.2.11` requires Contao `^5.3`.
- Do not remove any RockSolid package before checking `tl_content` and form/module data; removal would
  break stored content or form protection.
- Patch releases should not change the schema. Verify stored content types and theme templates after
  each upgrade.
- The slider requires Doctrine DBAL `^3.3 || ^4.0`; the #8 DBAL/Doctrine sweep must keep that satisfied.

## 8. Altcha Antispam

**Today**

- `markocupic/contao-altcha-antispam` `0.6.9`.
- Configured in `contao/config/config.yaml`:
  `algorithm: SHA-256`, `range_min: 1000`, `range_max: 10000`, `challenge_expiry: 3600`.
- The bundle manages the form challenge; no application template reference was found.

**Required migration**

- Bridge to `0.7.3` on 4.13 only after verifying the config keys and challenge markup are unchanged.
- Target `^0.8.0` at #8 (requires Contao `^5.3`, Symfony `^6.4 || ^7.4 || ^8.0`).
- Re-check the config keys in `0.8.0`; rename/migrate them if the bundle changed the tree.
- Verify `markocupic/contao-twig-assets` remains compatible with the target Twig/Symfony set.
- No database migration is expected; challenge state is runtime.

## 9. Payment, Mail, And PDF

**Payment (Novalnet, application-owned)**

- `NovalnetClient` uses `curl` against `https://payport.novalnet.de`; no Composer SDK.
- Persisted data: `tl_order`, `tl_novalnet_webhook_event`, member payment fields, and subscription data.
- Keep. Validate on PHP 8.5/Contao 5: session creation, hosted payment redirect, webhook signature,
  webhook cron, subscription/refund handling, and error paths.
- Secrets are environment-provided (`NOVALNET_PAYMENT_ACCESS_KEY`, `NOVALNET_API_SIGNATURE`,
  `NOVALNET_TEST_MODE`); never commit them.

**Mail (PHPMailer, application-owned)**

- `SensiqueMailHandler` uses `phpmailer/phpmailer` `v6.12.0` directly with hardcoded SMTP settings.
- Keep `^6.12`; Contao 5's Symfony Mailer is separate.
- Move hardcoded SMTP host/user/password to configuration/secrets as a separate security task.
- Regression: registration/welcome, admin notifications, payment pre-notification, invoice mail,
  revocation/cancellation mail, voucher mail.

**PDF (TCPDF, application-owned)**

- `SensiquePDF` extends `tecnickcom/tcpdf` `6.11.3`; invoices and vouchers use it.
- Keep `^6.11`. Regression: invoice PDF, voucher ZIP/PDF, fonts, attachments, and binary responses.
- No Contao coupling.

## 10. Frontend Components And Kartik Fileinput

**Today**

- `components/font-awesome` `4.7.0`, `components/jquery` `3.6.0`, `components/jqueryui` `1.12.1`.
- `components/*` are installed as `component` type via `oomphinc/composer-installers-extender`;
  `fe_page.html5` loads `/assets/...` paths.
- `kartik-v/bootstrap-fileinput` is `dev-master` in Composer, but templates load the checked-in
  `files/kartik-v/bootstrap-fileinput` asset.

**Required migration**

- Keep the three `components/*` packages and the installer extender while templates use `/assets/...`.
- Verify the Dockerfile/post-install moves still work with Contao 5's asset layout; avoid duplicate
  jQuery/jQuery UI/Font Awesome bundles from `contao-components/*`.
- Remove `kartik-v/bootstrap-fileinput` from `contao/composer.json`; keep the checked-in
  `files/kartik-v/bootstrap-fileinput` copy and document its upstream version.
- Do not change template script paths unless the asset copy is replaced deliberately.
- No database migration.

## 11. Docker, Compose, And Submodules

**Today**

- `Dockerfile` runs `composer install`, moves Font Awesome assets, then:
  `rm -R ./vendor/con4gis/core && composer dump-autoload`.
- `Dockerfile` symlinks `vendor/kaibuecking/core/src/Resources/public/` to `web/bundles/con4giscore`.
- `docker-compose.override.yaml` mounts `packages/core` and `packages/forum` over the vendor packages.
- `.gitmodules` points at `kaibuecking/CoreBundle.git` and `kaibuecking/ForumBundle.git`.

**Required migration (D1)**

- Remove the `vendor/con4gis/core` deletion workaround.
- Point the `con4giscore` public-asset symlink at the actual upstream `con4gis/core` v8 path; verify the
  directory layout in the installed package.
- Remove the `kaibuecking/core` submodule and mount. Keep a narrow Forum fork only if D3 requires it;
  update its URL/target and mount accordingly.
- Update `.gitmodules`, submodule pointers, compose mounts, and any `packages/*` paths together.
- Do not leave a second Core package identity or a deleted vendor directory in the image.

## 12. Data And Configuration Ordering

1. Snapshot database and files; prove the restore.
2. Record package/data counts (leads, NC, RockSolid content/forms, member uploads, cron state).
3. Apply 4.13 bridge upgrades and run bridge regression.
4. In #8, upgrade the package boundary and run `contao:migrate`.
5. Run NC 1 → 2 reconciliation and Leads retirement/export.
6. Run the full retained-feature smoke suite.
7. Only then plan the production cutover; keep the previous image tag and snapshot for rollback.
