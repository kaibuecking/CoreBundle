## Purpose

Provide the evidence-backed compatibility decisions, migration prerequisites, regression coverage, rollback plan, and exact Contao 5 handoff needed to remove every non-con4gis extension blocker from SensIQue's upgrade path.

## ADDED Requirements

### Requirement: Every direct extension has one explicit disposition
The change SHALL assign every direct non-con4gis Composer extension exactly one disposition: `keep`, `bridge`, `upgrade`, `replace`, or `remove`, together with the current locked version, the target version or removal outcome, and the timing (`bridge` or `#8`).

#### Scenario: Reviewing an extension
- **WHEN** a reviewer looks up any direct non-con4gis extension from `contao/composer.json`
- **THEN** the package has one disposition, a current version from `contao/composer.lock`, a target version or removal outcome, and a bridge-or-#8 timing

#### Scenario: Finding an unclassified extension
- **WHEN** a reviewer compares the direct requirement list with the compatibility matrix
- **THEN** no direct extension is missing a disposition, and transitive-only packages are identified as such

### Requirement: Bridge upgrades are supported on the current platform
The change SHALL approve a Contao 4.13 bridge upgrade only when the target release explicitly supports Contao 4.13 and the upgrade reduces distance to the final Contao 5 target.

#### Scenario: Evaluating a bridge candidate
- **WHEN** a package is proposed for a Contao 4.13 bridge
- **THEN** the recorded target constraint includes `^4.13` (or `>=4.13,<5.0`), and a targeted regression check for the affected feature is defined

#### Scenario: Rejecting an unsupported bridge
- **WHEN** a candidate release requires Contao `^5.2`, `^5.3`, `^5.6`, or `^5.7`
- **THEN** the package is deferred to #8 instead of being installed on Contao 4.13

### Requirement: Contao-5-only versions are deferred to the platform change
The change SHALL defer every version that requires Contao 5.2 or newer, or that crosses the con4gis/Notification Center package boundary, to the platform-upgrade change (#8).

#### Scenario: Checking a deferred package
- **WHEN** a reviewer inspects a package marked for #8
- **THEN** the target constraint and the reason it cannot run on Contao 4.13 are recorded

#### Scenario: Preparing the final upgrade
- **WHEN** the #8 implementer reads the handoff
- **THEN** the exact target constraints, platform requirements, and package-boundary order are available without reconstructing them from the matrix

### Requirement: Usage and data footprints are documented
The change SHALL document the observed code, template, configuration, upload, cron, and persisted-data footprint for each retained or removed extension, and SHALL distinguish verified code usage from data-driven or unverified usage.

#### Scenario: Reviewing a retained feature
- **WHEN** a reviewer inspects a retained extension
- **THEN** the entry identifies its application paths, templates, configuration keys, storage locations, and affected tables where known

#### Scenario: Reviewing an unverified feature
- **WHEN** code search finds no reference but the feature is database- or configuration-driven
- **THEN** the entry records that limitation and provides a read-only operator check instead of claiming the feature is unused

### Requirement: Resolver blockers are reconciled
The change SHALL record the locked Contao 5 resolver blockers and SHALL map each extension-side blocker to a target version, removal, or replacement.

#### Scenario: Comparing the blocker list
- **WHEN** a reviewer reads the compatibility matrix
- **THEN** every extension-side blocker from `composer prohibits contao/core-bundle 5.7.15 --locked` has a corresponding disposition

#### Scenario: Distinguishing platform blockers
- **WHEN** a blocker is a Contao 4.13 bundle or a local CLI platform gap
- **THEN** it is identified as part of the #8 platform sweep rather than mislabeled as an extension blocker

### Requirement: Migration prerequisites are explicit
The change SHALL document the data, configuration, template, upload, cron, Docker, Compose, and submodule prerequisites for every replace/remove/upgrade decision.

#### Scenario: Removing Leads
- **WHEN** the Leads removal is considered
- **THEN** the change requires a read-only `tl_lead*` data check and an export/archive before removal, with a documented `3.4.1` fallback if the feature is active

#### Scenario: Migrating Notification Center
- **WHEN** Notification Center 1 → 2 is planned
- **THEN** the change identifies the affected types, tables, module wiring, single-PM rule, maintenance window, and database snapshot requirement

#### Scenario: Removing the Core fork
- **WHEN** the Core fork is removed
- **THEN** the Dockerfile vendor deletion, public-asset symlink, Compose mount, submodule pointer, and `.gitmodules` entry are updated together

#### Scenario: Migrating cron
- **WHEN** the cron bundle is upgraded
- **THEN** the seven legacy jobs are moved off `system/initialize.php`, legacy `Backend`, `$cronJob`, and `TL_ROOT`, and double execution by `bbcron/startjobs` and `contao:cron` is prevented

### Requirement: Retained features have regression and rollback coverage
The change SHALL define at least one regression check and a rollback path for every retained feature, bridge upgrade, and the final platform upgrade.

#### Scenario: Running a bridge regression
- **WHEN** a bridge upgrade is applied
- **THEN** the affected feature check passes and the lockfile-only rollback is documented

#### Scenario: Rolling back the final upgrade
- **WHEN** the #8 upgrade fails a retained-feature check
- **THEN** code, database, files, Notification Center state, and fork mounts are restored together to the recorded pre-upgrade state

### Requirement: Evidence gaps are not filled by fabrication
The change SHALL distinguish verified Composer/code evidence from unavailable release notes, database state, and staging behavior, and SHALL assign a verification step to each gap.

#### Scenario: Release notes are unavailable
- **WHEN** upstream release notes cannot be accessed in the analysis environment
- **THEN** the gap is recorded and #8 must verify the release notes before applying the target version

#### Scenario: Database state is unknown
- **WHEN** a decision depends on persisted data
- **THEN** the change provides a read-only operator check against a restored/anonymized copy and does not assert the data state

### Requirement: The change remains analysis-only and safe
The change SHALL NOT modify application code, tests, Composer manifests or locks, build files, deployment configuration, database state, or runtime configuration, and SHALL NOT contain production data, credentials, dumps, or attachments.

#### Scenario: Reviewing the change scope
- **WHEN** a reviewer inspects the changed files
- **THEN** every file is inside the OpenSpec change directory and no application, build, deployment, or configuration file is modified

#### Scenario: Reviewing sensitive content
- **WHEN** a reviewer searches the change for secrets or personal data
- **THEN** only aggregate counts, package metadata, paths, and non-sensitive classifications are present

## Commit Message
docs(compatibility): document Contao 5 extension upgrade decisions (#6)
