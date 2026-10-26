## Why

SensIQue runs a customized `kaibuecking/forum` fork on the `dev-customfeaturesV2` branch and a small `kaibuecking/core` fork. The approved direction is to keep only a narrow SensIQue-owned fork on current upstream `con4gis/forum` 5.x, port verified custom behavior, and avoid rebuilding the forum. That port cannot be planned safely until the application's real Forum dependencies, the custom fork delta, and the persisted data are inventoried.

The deployed application revision is `b6ff330b66c37349c299028138433c2a764e2bde`; the pinned submodules are `packages/forum` at `490a475baacc4610e10d3e77daa96acf182b50ca` and `packages/core` at `bf42aa097419568b3eedeb658616a74c6a7a7194`. The forum fork contains 11 commits that are not reachable from its `main` branch. No upstream `v5.0.6` tag is present in any local repository, and this analysis has no GitHub/network access.

## What Changes

- Record every direct SensIQue application dependency on Forum, con4gis Core, Groups, Projects, subscriptions, personal messages, and Notification Center.
- Record the frontend/backend modules, templates, hooks, permissions, upload locations, and persisted tables used by SensIQue.
- Classify every one of the 11 custom Forum commits and the 3 custom Core commits as `retain`, `upstreamed`, `obsolete`, or `relocate`, with per-hunk detail where a commit mixes concerns.
- Produce a current-fork-to-upstream-`v5.0.6` delta matrix. Because `v5.0.6` is not locally available, record the blocked comparison and an exact operator verification procedure instead of inventing a result.
- Document subscription, Notification Center, and attachment persistence without copying production records.
- Provide operator-safe, read-only checks for table counts, relationships, attachment locations, notification wiring, and orphaned records against a restored/anonymized database.
- Identify sensitive data, unknown production usage, decision owners, and verification steps.
- Produce the exact retained customization list for the follow-up fork port (#3) and application/data integration (#4).

This change is documentation and exploration only. It does not update Composer dependencies, rebase the fork, migrate data, activate notifications, or alter runtime behavior.

## Capabilities

### New Capabilities

- `forum-migration-inventory`: Provides the authoritative, evidence-backed inventory and classification needed to port the SensIQue Forum fork onto upstream con4gis/forum 5.x without losing required behavior or data.

### Modified Capabilities

None.

## Impact

- Affected documentation only: this OpenSpec change directory.
- Inventoried repositories (read-only): the SensIQue application, `packages/forum`, and `packages/core`.
- Follow-up implementation will affect `packages/forum`, `packages/core`, application-owned Contao modules/templates/assets, Composer metadata, container configuration, Notification Center rows, and persisted Forum data. Those changes are explicitly out of scope here.
- Operational follow-up requires a restored/anonymized database and access to the upstream `v5.0.6` tag in a separately authorized environment.
