## Context

SensIQue is a legacy Contao application with two project-owned Git submodules:

| Repository | Revision | Role |
| --- | --- | --- |
| SensIQue application | `b6ff330b66c37349c299028138433c2a764e2bde` | Application modules, templates, assets, Composer manifest/lock, Docker configuration |
| `packages/forum` (`kaibuecking/forum`) | `490a475baacc4610e10d3e77daa96acf182b50ca` on `dev-customfeaturesV2` | Custom Forum bundle |
| `packages/core` (`kaibuecking/core`) | `bf42aa097419568b3eedeb658616a74c6a7a7194` on `dev-customfeaturesV2` | Custom Core bundle |

The application lock resolves `kaibuecking/core` and `kaibuecking/forum` from the fork remotes, but also resolves `con4gis/core` v7.1.7 transitively through `con4gis/groups` v2.8.6 and `con4gis/projects` v4.0.41. The application image deletes `vendor/con4gis/core` after `composer install`. That dual-core arrangement is part of the migration problem, not an incidental build detail.

The forum fork's `main` is not upstream `v5.0.6`; it is the fork branch from which the 11 custom commits diverge. Local tags end at `v3.10.7`, the only remotes are the fork remotes, and no `v5.0.6` tree is present in the workspace. Consequently the upstream side of the delta can only be recorded as blocked with a verification procedure.

## Goals / Non-Goals

**Goals:**

- Establish a complete, traceable inventory of application dependencies on Forum/con4gis behavior.
- Make every custom Forum and Core commit auditable and classify what should survive the port.
- Describe persisted subscriptions, personal messages, attachments, permissions, and Notification Center wiring without recording production records.
- Give operators verification checks that are read-only and safe against anonymized data.
- Give follow-up issues #3 (fork port) and #4 (application/data integration) an exact retained-customization list.
- Make unknowns explicit, owned, and verifiable.

**Non-Goals:**

- Updating Composer dependencies or rebasing the fork.
- Migrating data or activating Notification Center.
- Changing application code, tests, build, deployment, or runtime configuration in this change.
- Copying production data, credentials, personal information, attachment files, or database dumps into Git.
- Assuming every historical customization must be retained.

## Decisions

### Treat the repository as the source of truth, not production guesses

Inventory claims cite application paths and commit hashes. Production-dependent claims are listed as assumptions or unknowns with an operator check. This avoids turning a code inventory into an unverified data migration plan.

### Classify commits, not just files

A single custom Forum commit can mix packaging, UI, API, and language changes. The delta matrix classifies each commit as a whole and splits mixed commits into per-hunk retention targets. The default is `retain` unless the hunk is provably packaging-only, test-only, or better expressed in application-owned code.

### Do not mark anything `upstreamed` without the upstream tree

PHP 8 guards and null checks are likely upstream candidates, but without `v5.0.6` they remain `retain` with an explicit “verify upstream” note. Removing them speculatively would risk behavior loss. `upstreamed` is reserved for evidence from the actual upstream tag.

### Keep fork logic narrow and move presentation to the application

Language strings, template overrides, and CSS already exist in the application and can stay application-owned. The fork should retain only logic that cannot be expressed through application modules, templates, or configuration. The abandoned `customfeaturesV3` branch attempted this split; it is evidence, not the deployed baseline, and is not trusted as an upstream comparison.

### Treat the custom personal-message API as application integration

The private chat frontend calls `/con4gis/forumPnService/…` actions added by the fork, and the login template calls `ForumController::getMessageCount()`. This behavior is used by SensIQue-owned templates and JavaScript, so it must be preserved during the port. The decision of whether it lives in the fork or in an application-owned controller is deferred to #3, but the behavior itself is retained.

### Separate fork, application, and data work packages

- #3: fork port and core-delta reduction.
- #4: application integration, Notification Center configuration, and data verification.
This keeps the future change reviewable and prevents data operations from being bundled with code changes.

## Artifact Map

| Artifact | Content |
| --- | --- |
| `inventory.md` | Feature-to-code/table/template matrix and application dependency inventory |
| `delta-matrix.md` | 11 Forum commits + 3 Core commits, classifications, and upstream `v5.0.6` comparison status/procedure |
| `data-inventory-checklist.md` | Operator-safe SQL and filesystem checks; anonymization and sensitive-data rules |
| `retained-customizations.md` | Exact retained list for #3 and #4, separated from drop/relocate items |
| `known-unknowns.md` | Known, assumptions, unknowns, decisions required, owners, verification steps |
| `specs/forum-migration-inventory/spec.md` | Testable requirements for the inventory deliverables |

## Risks / Trade-offs

- **Upstream comparison is blocked.** `v5.0.6` is absent locally and GitHub access is prohibited for this analysis. Mitigation: the delta matrix records the exact fork-side evidence and an authorized comparison procedure; no commit is falsely classified as upstreamed.
- **Inventory can drift from production.** Code and Git revisions are exact, but database usage and upload locations are not. Mitigation: every production-dependent claim is an assumption or unknown with an operator check and owner.
- **The fork mixes behavior with presentation.** A naive rebase could preserve brittle global state or lose application overrides. Mitigation: per-hunk classification and a separate application-owned presentation target.
- **Notification behavior changed inside the fork.** `C4gForumPn::send()` no longer calls the legacy notifier, while the custom PM endpoint sends the Notification Center `mail_new_pm` type. Mitigation: document both paths and require a single-notification verification in #4.
- **Dual core packages can produce false conclusions.** The runtime deletes `con4gis/core`, while Groups/Projects still require it. Mitigation: call out the dual package explicitly and make package consolidation a decision for #3.
- **Sensitive data could leak into the plan.** Mitigation: no record dumps, no filenames, no usernames/emails/message text in Git; only counts, IDs, schema, and aggregate checks.

## Migration Plan (Follow-up, Not This Change)

1. In an authorized environment, fetch upstream `v5.0.6` and complete the upstream side of `delta-matrix.md`.
2. Resolve decisions D1–D8 in `known-unknowns.md` with the named owners.
3. Port only retained #3 items onto a new branch based on `v5.0.6`; move presentation and application integration to #4.
4. Run the operator-safe checks against a restored/anonymized database and record only aggregate results.
5. Validate the port in a staging environment with representative, non-production data before any production cutover.

Rollback for this change is trivial: revert the documentation change. No runtime or data state is touched.
