## Purpose

Provide the authoritative, evidence-backed inventory and classification needed to port the SensIQue Forum fork onto upstream con4gis/forum 5.x without losing required behavior or data.

## ADDED Requirements

### Requirement: Application dependencies are fully inventoried
The inventory SHALL list every direct SensIQue application dependency on Forum, con4gis Core, Groups, Projects, subscriptions, personal messages, and Notification Center, with the responsible code path, template, asset, package, table, or configuration source.

#### Scenario: Reviewing a listed dependency
- **WHEN** a reviewer follows any dependency entry in the inventory
- **THEN** the entry identifies the exact application or bundle path, the observable behavior, and the persisted data or API it touches

#### Scenario: Searching for an unlisted dependency
- **WHEN** a reviewer searches the application for Forum/con4gis classes, packages, tables, modules, notification types, or templates
- **THEN** every direct application reference is represented in the inventory or explicitly recorded as absent

### Requirement: Every custom Forum and Core commit is classified
The change SHALL classify each of the 11 custom Forum commits and each of the 3 custom Core commits as `retain`, `upstreamed`, `obsolete`, or `relocate`, and SHALL split mixed commits into per-hunk targets.

#### Scenario: Reviewing a custom commit
- **WHEN** a reviewer inspects a custom commit in the delta matrix
- **THEN** the commit has one primary class, an observable-behavior description, and a follow-up target for #3 or #4

#### Scenario: Reviewing a mixed commit
- **WHEN** a commit contains packaging, presentation, and behavior changes
- **THEN** the matrix records each hunk's class and target instead of assigning the whole commit a misleading label

### Requirement: Upstream delta evidence is recorded without fabrication
The change SHALL record the deployed fork side of the delta against upstream `v5.0.6` and SHALL distinguish verified evidence from blocked or unknown comparison.

#### Scenario: Upstream tag is unavailable
- **WHEN** the upstream `v5.0.6` tree cannot be accessed in the analysis environment
- **THEN** the matrix records the comparison as blocked, lists the evidence available from the fork, and provides an authorized verification procedure

#### Scenario: Upstream tag is available during follow-up
- **WHEN** an authorized operator compares each custom commit with the `v5.0.6` tree
- **THEN** the classification is updated only with the resulting evidence, and `upstreamed` is used only where equivalent upstream behavior is demonstrated

### Requirement: Persistence is documented without production records
The change SHALL document Forum/subscription/personal-message/attachment persistence, including tables, relationships, and storage locations, without copying production records.

#### Scenario: Reviewing subscription persistence
- **WHEN** a reviewer reads the persistence inventory
- **THEN** thread and subforum subscription tables, member/thread/forum relationships, and cleanup behavior are identified without member data

#### Scenario: Reviewing attachment persistence
- **WHEN** a reviewer reads the attachment inventory
- **THEN** forum uploads, `tl_files` linkage, avatar folders, and configured upload folders are identified without filenames or file contents

### Requirement: Notification Center state is inventoried
The change SHALL document the existing Notification Center types, tokens, module wiring, and missing setup, and SHALL distinguish database-configured state from code-registered types.

#### Scenario: Reviewing notification types
- **WHEN** a reviewer reads the notification inventory
- **THEN** all seven `con4gis Forum` types and their token contracts are listed with their code registration

#### Scenario: Reviewing notification setup
- **WHEN** a reviewer reads the notification checklist
- **THEN** the check identifies missing notification rows, languages, gateways, or forum-module wiring without exposing message content or credentials

### Requirement: Operators receive read-only verification checks
The change SHALL provide operator-safe checks for table counts, relationships, orphaned records, notification wiring, data-dependent constants, and attachment locations.

#### Scenario: Running the data inventory
- **WHEN** an operator runs the checklist against a restored and anonymized database
- **THEN** the checks return counts, booleans, IDs, and relationship results using read-only queries and no content dumps

#### Scenario: Interpreting an orphan result
- **WHEN** a check reports orphaned threads, posts, personal messages, subscriptions, uploads, or reactions
- **THEN** the checklist identifies the relationship and the corresponding cleanup or migration decision without executing destructive changes

### Requirement: Sensitive data never enters the repository
The change SHALL prohibit production records, credentials, database dumps, attachment files, usernames, e-mail addresses, and message content from being committed.

#### Scenario: Recording inventory results
- **WHEN** an operator records the outcome of a data check
- **THEN** only aggregate counts, booleans, IDs, and non-sensitive classifications are recorded in the follow-up issue or private operational document

#### Scenario: Reviewing the change
- **WHEN** a reviewer inspects the change contents
- **THEN** no production record, credential, dump, attachment, personal identifier, or message content is present

### Requirement: Retained customizations are explicit for follow-up work
The change SHALL provide an exact retained customization list for work packages #3 and #4, separated from items to relocate, drop, or verify upstream.

#### Scenario: Starting the fork port
- **WHEN** the #3 implementer starts the port onto upstream 5.x
- **THEN** the retained-customization list identifies the required behavior, source commit, affected files, and verification for each retained item

#### Scenario: Starting application and data integration
- **WHEN** the #4 implementer starts application, notification, or data work
- **THEN** the retained-customization list identifies application-owned overrides, data-dependent constants, notification configuration, and upload locations

### Requirement: Unknown production usage has an owner and verification step
The change SHALL list every material unknown with an owner, an operator-safe verification step, and whether it blocks the port.

#### Scenario: Resolving an unknown
- **WHEN** an owner picks up an unknown from the register
- **THEN** the entry identifies the exact evidence to collect and the decision it unblocks

#### Scenario: Deciding follow-up scope
- **WHEN** the team decides whether #3 or #4 can start
- **THEN** the decision register shows which unknowns and decisions block the port and who is responsible for resolving them
