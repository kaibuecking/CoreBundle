## Context

SensIQue is a legacy Contao application at `b6ff330b66c37349c299028138433c2a764e2bde`. Its Composer project lives in `contao/`; the image builds from `contao/composer.json` and `contao/composer.lock` with PHP `8.5.12`.

The final platform direction is already fixed by the recorded decisions D1–D10 from the Forum inventory:

| Package | Today | Target | Constraint |
| --- | --- | --- | --- |
| `contao/core-bundle` | `4.13.58` | `^5.3` (planned `5.7.15`) | Forum `v5.0.6` and Groups `v2.10.x` |
| `con4gis/core` | `v7.1.7` (transitive) plus `kaibuecking/core` fork | `^8` | Forum, Groups, Projects |
| `con4gis/forum` | `kaibuecking/forum` `customfeaturesV2` `490a475` | narrow fork on `v5.0.6` | D1/D3 |
| `con4gis/projects` | `v4.0.41` | `^5` (`v5.0.43`) | `^4.13 || ^5.3`, core `^8`, NC `^2` |
| `con4gis/groups` | `v2.8.6` | `^2.10` (`v2.10.2`) | Contao `^5.3`, projects `^5` |
| `terminal42/notification_center` | `1.6.18` | `^2` (`2.7.8`) | Projects `v5.0.43` requires NC `^2.0` |

The upstream organisation was renamed from `con4gis` to `Kuestenschmiede`; Composer package names stay `con4gis/*`. NC 1 → 2 is a migration, not a version bump (D7).

## Goals / Non-Goals

**Goals:**

- Give every direct non-con4gis extension one evidence-backed disposition.
- Separate safe Contao 4.13 bridge upgrades from Contao-5-only versions.
- Identify data, configuration, template, upload, cron, and build migrations before removal or replacement.
- Define regression coverage and rollback for every retained feature.
- Provide #8 with exact package, build, and data constraints.

**Non-Goals:**

- Upgrading Contao core or crossing the Contao 5 boundary.
- Updating packages blindly or changing constraints without metadata evidence.
- Removing a feature that has no approved replacement/retirement decision.
- Running bridge upgrades or data migrations inside this analysis change.
- Editing vendor code or suppressing platform requirements.

## Decisions

### Lock state plus Composer metadata is the evidence boundary

Every current version and constraint comes from `contao/composer.lock`. Every target or bridge version comes from read-only Composer metadata (`composer show -a <package> <version>`). The resolver blocker list comes from `composer prohibits contao/core-bundle 5.7.15 --locked`. Release notes could not be fetched without prohibited GitHub access; this is recorded as an evidence gap that #8 must close before applying the final upgrade.

### One disposition per package, not one blanket upgrade

Packages are handled individually. A package that already supports Contao 5.0 may need no change; a package that only supports Contao 5.7 must wait for #8; an unused package is removed only after its persisted data is checked.

### Bridge upgrades are a narrow, supported subset

A bridge upgrade is allowed on Contao 4.13 only when the target release explicitly supports 4.13 and the upgrade reduces distance to the #8 target. The selected candidates are:

- `terminal42/contao-fineuploader` `3.5.4` → `3.5.5`
- `netzmacht/contao-font-awesome-inserttag` `2.2.0` → `2.2.1`
- `madeyourday/contao-rocksolid-antispam` `v2.1.2` → `v2.1.3`
- `madeyourday/contao-rocksolid-slider` `v2.2.9` → `v2.2.10`
- `markocupic/contao-altcha-antispam` `0.6.9` → `0.7.3` (minor; verify config/challenge markup first)

No bridge is approved for cron, the Contao-5-only Font Awesome Inserttag `2.2.3`, Leads `3.x`, NC `2.x`, or the con4gis package boundary.

### Contao-5-only versions belong to #8

`bugbuster/contao-cron-bundle` `1.7.3`, `netzmacht/contao-font-awesome-inserttag` `2.2.3`, `terminal42/contao-leads` `3.4.x`, NC `2.7.8`, and the con4gis 8/projects 5/groups 2.10/forum 5 boundary are deferred. #8 applies them together with the Contao core upgrade, because their constraints require Contao 5.3+ or 5.6+.

### Removal is data-gated

`terminal42/contao-leads` has no application code, template, DCA, or configuration reference. It remains a direct Composer requirement and may hold form data. Its disposition is `remove`, but only after a read-only check confirms no `tl_lead*` data and no active export requirement. If data exists, export/archive first; if the feature is still required, the fallback is `3.4.1` at #8.

### Frontend assets are application-owned where possible

`components/font-awesome`, `components/jquery`, and `components/jqueryui` are loaded from `/assets/...` and moved by the Dockerfile/post-install scripts. They already work on Contao 5 and are kept application-owned. `kartik-v/bootstrap-fileinput` is a `dev-master` Composer requirement, while the templates load the checked-in `files/kartik-v/bootstrap-fileinput` copy; the Composer requirement is removed and the pinned application asset remains.

## Artifact Map

| Artifact | Content |
| --- | --- |
| `compatibility-matrix.md` | Current versions, constraints, usage evidence, blocker status, bridge/target versions, regression |
| `package-decisions.md` | One keep/upgrade/replace/remove decision per package and rationale |
| `migration-notes.md` | Data, configuration, template, upload, cron, and build migrations |
| `regression-rollback.md` | Feature regression matrix and rollback plan |
| `issue-8-handoff.md` | Exact manifest, Docker, Compose, submodule, cron, and data changes for #8 |
| `operator-checks.md` | Read-only Composer/SQL/filesystem checks and sensitive-data rules |
| `specs/extension-compatibility/spec.md` | Testable requirements for the compatibility decision |

## Risks / Trade-offs

- **Release notes are not available in this environment.** Composer metadata describes constraints but not behavioural changes. Mitigation: record the gap; #8 re-checks upstream release notes before applying target versions.
- **Bridge upgrades can disturb a stable 4.13 platform.** Mitigation: only patch-level releases plus one Altcha minor, each with a targeted smoke test and lockfile-only rollback.
- **Leads removal can delete form history.** Mitigation: data-gated removal with export/archive and a documented 3.4.1 fallback.
- **RockSolid and Altcha usage is data/config-driven.** Code search cannot prove use. Mitigation: operator checks against `tl_content`, `tl_form`, and module configuration.
- **NC 1 → 2 crosses a schema/API boundary.** Mitigation: never bridge NC on 4.13; migrate it in #8 with the Projects/Forum boundary and D7 runbook.
- **The final version set can drift after this analysis.** Mitigation: locked versions and constraints are authoritative; #8 re-verifies Composer metadata and release notes before changing the manifest.

## Migration Plan (Follow-up, Not This Change)

1. Apply only the approved 4.13 bridge upgrades in a dedicated branch (SensIQue#18); commit `contao/composer.json`, `contao/composer.lock`, and targeted template/config adjustments only.
2. Build the image and run the bridge regression checks in staging.
3. Hand the exact #8 constraints and data prerequisites to the platform-upgrade change.
4. In #8 (SensIQue#8), upgrade Contao, con4gis, NC, cron, Font Awesome Inserttag, Leads disposition, RockSolid, and Altcha together; run `contao:migrate`, data migrations, and the full smoke suite.
5. Keep the previous image tag and a database/files snapshot for rollback.

Rollback for this analysis change is trivial: revert the documentation change. No runtime or data state is touched.
