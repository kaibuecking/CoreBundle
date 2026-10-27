# Tasks

## 1. Evidence And Scope

- [x] 1.1 Record the application, Core, and Forum revisions and the Contao/PHP/Composer baseline.
- [x] 1.2 Extract current extension versions and constraints from `contao/composer.lock`.
- [x] 1.3 Read candidate versions and constraints from read-only Composer metadata.
- [x] 1.4 Capture the `composer prohibits contao/core-bundle 5.7.15 --locked` blocker list.
- [x] 1.5 Search the application, templates, DCA, config, cron, Docker, and compose files for extension usage.
- [x] 1.6 Record the evidence gaps (release notes, database/staging access).

## 2. Decisions

- [x] 2.1 Classify each package as keep, bridge, upgrade-at-#8, replace, or remove.
- [x] 2.2 Separate safe Contao 4.13 bridges from Contao-5-only versions.
- [x] 2.3 Define the data-gated Leads removal and its fallback.
- [x] 2.4 Define the NC 1 → 2 migration boundary and the single-PM rule.
- [x] 2.5 Define the Core-fork removal and the narrow Forum-fork target.
- [x] 2.6 Define the frontend asset and Kartik handling.

## 3. Artifacts

- [x] 3.1 Write `proposal.md` with scope, decisions, and impact.
- [x] 3.2 Write `design.md` with context, decisions, risks, and migration plan.
- [x] 3.3 Write `compatibility-matrix.md` with current/target evidence and usage.
- [x] 3.4 Write `package-decisions.md` with one disposition per package.
- [x] 3.5 Write `migration-notes.md` for data/config/template/cron/build migration.
- [x] 3.6 Write `regression-rollback.md` with retained-feature checks and rollback.
- [x] 3.7 Write `issue-8-handoff.md` with manifest/build/data prerequisites.
- [x] 3.8 Write `operator-checks.md` with read-only verification and sensitive-data rules.
- [x] 3.9 Write `specs/extension-compatibility/spec.md` with ADDED requirements and scenarios.

## 4. Validation

- [x] 4.1 Confirm every direct non-con4gis extension in `contao/composer.json` has a decision.
- [x] 4.2 Confirm every resolver blocker has a target or a documented removal/replacement.
- [x] 4.3 Confirm no artifact modifies application code, tests, build, deployment, or configuration.
- [x] 4.4 Run `openspec validate issue-6-resolve-third-party-extension-blockers-f --type change --strict --json --no-interactive`.
- [x] 4.5 Fix all ERROR findings and re-run validation until it passes.
- [x] 4.6 Report the change directory and validation result.

## 5. Follow-Ups Outside This Change

The implementation work derived from this analysis is tracked in separate, approved work items. Nothing in this section is a task of this analysis change.

- **Contao 4.13 bridge upgrades** — SensIQue#18: fineuploader 3.5.5, Font Awesome inserttag 2.2.1, RockSolid anti-spam v2.1.3, RockSolid slider v2.2.10, conditional Altcha 0.7.3, and removal of the `kartik-v/bootstrap-fileinput` requirement.
- **Contao 5 platform upgrade** — SensIQue#8: target versions, operator data checks, Leads disposition, Core-fork removal, cron migration, `contao:migrate`, Notification Center 1 → 2, full regression suite, and rollback proof, using `issue-8-handoff.md`, `migration-notes.md`, and `regression-rollback.md`.

The package decisions, regression checks, and rollback steps for both work items are already recorded in this change directory.
