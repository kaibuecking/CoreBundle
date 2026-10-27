## Why

SensIQue runs Contao `4.13.58` with a mix of maintained, legacy, and fork-only extensions. The final Contao 5.7 upgrade cannot be planned safely while several direct dependencies still forbid Contao 5, while other packages already support 5.x but are pinned to older releases. The issue must produce one evidence-backed disposition per direct extension and separate safe Contao 4.13 bridge upgrades from versions that belong to the final platform change (#8).

The analysis is based on `contao/composer.json`, `contao/composer.lock`, the application code/templates/configuration, and read-only Composer metadata checked on **2026-10-27**. The locked versions and constraints remain authoritative; no package was installed or updated.

## What Changes

- Inventory every direct non-con4gis extension with its locked version, current constraints, code/config/template usage, data footprint, and whether it blocks Contao 5.
- Record one explicit `keep`, `upgrade`, `replace`, or `remove` decision per package, with target version and rationale.
- Record the exact current resolver blockers from `composer prohibits contao/core-bundle 5.7.15 --locked`.
- Select only supported, risk-reducing bridge upgrades for Contao 4.13 and defer every Contao-5-only version to #8.
- Document data, configuration, template, upload, cron, and build migrations before any package is replaced or removed.
- Define regression coverage for every retained feature and a rollback plan for bridge upgrades and the final upgrade.
- Hand #8 the exact manifest, Docker, Compose, submodule, cron, and data prerequisites.

## Capabilities

### New Capabilities

- `extension-compatibility`: Evidence-backed compatibility decisions, migration notes, regression coverage, rollback plan, and the exact Contao 5 handoff for every non-con4gis extension used by SensIQue.

### Modified Capabilities

None.

## Impact

- Documentation/specification only in this change directory. No application code, tests, build, deployment, Composer manifest, lock file, database, or runtime configuration is modified here.
- Inventoried repositories (read-only): the SensIQue application, `packages/core`, and `packages/forum`.
- The bridge-upgrade tasks and the #8 handoff identify future changes to `contao/composer.json`/`composer.lock`, `Dockerfile`, `docker-compose*.yaml`, `.gitmodules`, `cron/*/crontab`, `system/modules/cron/jobs/`, templates, and persisted data. Those changes are not executed by this analysis change.
- #8 remains the only change allowed to cross the Contao 4.13 → 5.7 boundary.

## Non-Goals

- No Contao core upgrade in this issue.
- No blind latest-version update or unrelated dependency sweep.
- No removal of an actively used feature without an approved replacement or retirement decision.
- No manual vendor edits, ignored platform requirements, or fabricated upstream compatibility.
- No production data, credentials, database dumps, attachment files, usernames, or e-mail addresses in the repository.
