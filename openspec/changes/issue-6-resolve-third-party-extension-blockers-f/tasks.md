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

## 5. Follow-Up: Contao 4.13 Bridges (Separate Change)

- [ ] 5.1 Upgrade `terminal42/contao-fineuploader` to `3.5.5` and run the upload checks.
- [ ] 5.2 Upgrade `netzmacht/contao-font-awesome-inserttag` to `2.2.1` and render all icon variants.
- [ ] 5.3 Upgrade `madeyourday/contao-rocksolid-antispam` to `v2.1.3` and test legit/spam submits.
- [ ] 5.4 Upgrade `madeyourday/contao-rocksolid-slider` to `v2.2.10` and render slider content.
- [ ] 5.5 Conditionally upgrade `markocupic/contao-altcha-antispam` to `0.7.3` after config/markup review.
- [ ] 5.6 Remove the `kartik-v/bootstrap-fileinput` Composer requirement and verify the checked-in asset.

## 6. Follow-Up: Issue #8

- [ ] 6.1 Re-verify target versions and upstream release notes with authorized access.
- [ ] 6.2 Complete the operator data checks and decide Leads remove vs retain.
- [ ] 6.3 Apply the Contao 5 / con4gis / NC 2 / cron / Font Awesome target set.
- [ ] 6.4 Remove the Core fork and update Docker, compose, `.gitmodules`, and Forum fork mounts.
- [ ] 6.5 Migrate the seven cron jobs off the legacy bootstrap.
- [ ] 6.6 Run `contao:migrate`, NC 1 → 2 reconciliation, and Leads export/removal.
- [ ] 6.7 Run the full retained-feature regression suite.
- [ ] 6.8 Prove rollback to the pre-#8 image and database/files snapshot.
