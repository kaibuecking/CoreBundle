# Handoff To Issue #8 (Platform Upgrade)

Issue #6 decides; issue #8 executes. This document is the exact input contract for #8. Versions are the
2026-10-27 evidence set and must be re-verified against Composer metadata and upstream release notes
before the manifest is changed.

## 1. Preconditions

- #6 is approved and merged.
- A staging environment can restore an anonymized copy of the production database and files.
- The operator checks in `operator-checks.md` are complete.
- A pre-upgrade database dump, files snapshot, and current image tag/digest are recorded.
- The #1 Forum fork decisions (D1–D10) are accepted.

## 2. Target Composer Set

Application project: `contao/composer.json` / `contao/composer.lock`.

### Platform

| Package | Target constraint | Evidence |
| --- | --- | --- |
| `php` | `>=8.5.0` (keep current floor) | The app already requires `>=8.5.0`; Contao `5.7.15` requires `^8.3`, and PHP `8.5` satisfies it. Do not lower the floor without an approved runtime change. |
| `contao/core-bundle` | `^5.7` (`5.7.15` planned) | Fixed platform decision |
| `contao/manager-bundle` | `^5.7` | Must match `core-bundle` |
| `contao/conflicts` | Keep only if required by the Contao 5 skeleton | Metapackage; verify before carrying the current `dev-main` requirement forward |
| `symfony/*` | `^7.4` where directly constrained | `contao/core-bundle 5.7.15` requires Symfony `^7.4` |

Do not pin transitive Symfony/Doctrine packages manually; let the Contao 5 set resolve them, then verify.

### Extensions

| Package | Current | Target | Action |
| --- | --- | --- | --- |
| `bugbuster/contao-cron-bundle` | `1.5.7` | `^1.7.3` | Upgrade + migrate seven jobs |
| `netzmacht/contao-font-awesome-inserttag` | `2.2.0` (bridge `2.2.1`) | `^2.2.3` | Upgrade |
| `terminal42/contao-leads` | `1.4.33` | Remove; fallback `^3.4.1` only if active use confirmed | Data-gated |
| `terminal42/notification_center` | `1.6.18` | `^2` (`2.7.8`) | Migrate NC 1 → 2 |
| `terminal42/contao-fineuploader` | `3.5.4` (bridge `3.5.5`) | `^3.5.5` | Upgrade |
| `madeyourday/contao-rocksolid-antispam` | `v2.1.2` (bridge `v2.1.3`) | `^2.1.3` | Upgrade |
| `madeyourday/contao-rocksolid-columns` | `v2.1.2` | `^2.1.3` | Upgrade (Contao 5 only) |
| `madeyourday/contao-rocksolid-slider` | `v2.2.9` (bridge `v2.2.10`) | `^2.2.11` | Upgrade (Contao 5 only) |
| `markocupic/contao-altcha-antispam` | `0.6.9` (bridge `0.7.3`) | `^0.8.0` | Upgrade (Contao 5 only) |
| `con4gis/core` | `v7.1.7` | `^8` | Upgrade; remove Core fork |
| `con4gis/projects` | `v4.0.41` | `^5` (`v5.0.43`) | Upgrade |
| `con4gis/groups` | `v2.8.6` | `^2.10` (`v2.10.2`) | Upgrade |
| `con4gis/forum` | `kaibuecking/forum` fork | Narrow fork on `v5.0.6` | Replace (D1/D3) |
| `kaibuecking/core` | `dev-customfeaturesV2` | Remove | D1 |
| `kaibuecking/forum` | `dev-customfeaturesV2` | Remove after narrow fork is published | D1/D3 |

### Application-Owned Packages

Keep and re-verify:

- `phpmailer/phpmailer` `^6.12`
- `tecnickcom/tcpdf` `^6.11`
- `components/font-awesome` `4.7.0`
- `components/jquery` `3.6.0`
- `components/jqueryui` `1.12.1`
- `curl/curl` `2.5.0` and the `ext-curl` runtime extension
- `oomphinc/composer-installers-extender` `2.0.0` while `components/*` remain
- `contao/conflicts` only if the Contao 5 managed-edition skeleton still requires it

Remove:

- `kartik-v/bootstrap-fileinput` Composer requirement; keep the checked-in
  `files/kartik-v/bootstrap-fileinput` asset.
- `contao-community-alliance/composer-plugin` once NC 1/Leads 1 are gone.

## 3. Expected Resolution Consequences

- `codefog/contao-haste` moves to `^5.2` via NC 2 (and `^5.0` if Leads 3 is retained).
- `menatwork/contao-multicolumnwizard-bundle` moves to the Projects 5 requirement (`^3.6`); verify.
- `contao-components/jquery` and `contao-components/jquery-ui` arrive with Contao 5; confirm they do not
  conflict with the application-owned `/assets/jquery*` paths.
- The `contao/*` 4.13 bundles are replaced by the Contao 5 bundle set; `self.version` blockers disappear.
- Re-run `composer prohibits contao/core-bundle 5.7.15 --locked` and expect no extension blockers.

## 4. Manifest/Resolution Steps

1. In a dedicated branch, update `contao/composer.json` to the target constraints above.
2. Run `composer update --with-all-dependencies` (or the project's documented equivalent) with the
   intended platform PHP; do not use `--ignore-platform-reqs`.
3. Confirm `composer validate --no-check-publish` passes.
4. Review the full `contao/composer.lock` diff; reject unrelated major changes.
5. Re-run the resolver check and record the result.
6. Build the image from the new lock.

## 5. Docker And Runtime Changes

Current `Dockerfile` behavior to remove/replace:

```dockerfile
# Current workaround, to be removed:
rm -R ./vendor/con4gis/core
composer dump-autoload
```

- Delete the `vendor/con4gis/core` removal; upstream `con4gis/core ^8` is the only Core.
- Apply D6 with the fork removal: drop the legacy Core vendor uploader (`imgUpload.php`,
  `DialogHandler.js`). Keep `terminal42/contao-fineuploader`; D6 does not retire it.
- Update the `web/bundles/con4giscore` public-asset symlink to the actual installed
  `con4gis/core` v8 resources path. Verify the path in the installed package; do not assume the v7 path.
- Remove the `packages/core` submodule and its compose mount.
- If a narrow Forum fork is still required, update `packages/forum` to the published fork and keep its
  mount; otherwise remove it and depend on upstream `con4gis/forum`.
- Update `.gitmodules` and submodule pointers in the same change.
- Confirm the Font Awesome/jQuery/jQuery UI asset moves still target `/assets/...`.
- Confirm Composer install runs without the deleted-vendor workaround.

Files to update together:

- `Dockerfile`
- `docker-compose.yaml` / `docker-compose.override.yaml`
- `.gitmodules`
- `packages/core` and `packages/forum` submodule pointers
- `contao/composer.json`, `contao/composer.lock`

## 6. Cron And Scheduler Changes

- Upgrade cron bundle to `^1.7.3`.
- Migrate the seven jobs in `contao/system/modules/cron/jobs/` to Contao 5 cron services; remove
  `system/initialize.php`, legacy `Backend`, global `$cronJob`, and `TL_ROOT`.
- Decide the runner: keep `bbcron/startjobs`, switch to `contao:cron`, or both. Avoid double execution.
- Keep the schedules and side effects of:
  `PurgeLog`, `createVouchersCron`, `deleteTerminatedMembershipsCron`,
  `deleteUnpayedMembershipsCron`, `deleteUnreferencedSubscriptions`,
  `sendPaymentPrenotifaction`, `updateUserMembershipsCron`.
- Do not conflate the bundle jobs with the non-bundle `ZipSensiqueInvoice` script and backup jobs.

## 7. Data Migrations In #8

Run in this order with a snapshot first:

1. `contao:migrate` and clear the Contao cache.
2. NC 1 → 2 reconciliation: types, messages, languages, gateways, registrations; resolve module IDs.
3. Leads disposition: export/archive data before removal, or upgrade to `3.4.1` if active.
4. Cron job/log state verification.
5. Fineuploader upload paths/`tl_files` verification.
6. RockSolid content/form settings verification.
7. Altcha config key migration if `0.8.0` changed the tree.
8. Full retained-feature smoke suite from `regression-rollback.md`.

## 8. Acceptance Criteria For #8

- Contao `5.7.x` and the target extension set resolve with no extension blockers.
- The image builds without the Core-fork deletion/symlink workaround.
- The narrow Forum fork (if any) is the only fork, based on `v5.0.6`.
- NC 1 → 2 sends exactly one PM and one notification per subscription event.
- Cron jobs run once, on schedule, with no duplicate side effects.
- Certificate/avatar uploads, RockSolid content, Altcha, Font Awesome, mail, PDF, and payments pass.
- Leads is removed with zero data, or retained at `3.4.1` with archived data and a passing form test.
- Rollback to the pre-#8 image and snapshot is proven.

## 9. Open Items #8 Must Close

- Fetch and review upstream release notes/changelogs for every target version (not available in #6).
- Confirm the final narrow Forum fork URL, branch/tag, and mount.
- Confirm the `con4gis/core` v8 public-asset path used by the Dockerfile symlink.
- Confirm whether `contao/conflicts` is still required by the Contao 5 skeleton.
- Confirm the Leads disposition from the operator data check.
- Confirm the application-owned jQuery/jQuery UI assets do not duplicate or conflict with
  `contao-components/*`.
