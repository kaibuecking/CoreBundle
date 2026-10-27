# Application Inventory

Baseline: SensIQue `b6ff330b66c37349c299028138433c2a764e2bde`; `packages/forum` `490a475baacc4610e10d3e77daa96acf182b50ca`; `packages/core` `bf42aa097419568b3eedeb658616a74c6a7a7194`. Paths below are relative to the SensIQue repository unless prefixed with `forum:` or `core:` (the submodules).

## 1. Composer and Runtime Dependencies

| Dependency | Evidence | Observed use | Migration note |
| --- | --- | --- | --- |
| `kaibuecking/forum` `dev-customfeaturesV2` | `contao/composer.json`, `contao/composer.lock` | Forked Forum bundle | Replace with narrow fork based on upstream 5.x |
| `kaibuecking/core` `dev-customfeaturesV2` | `contao/composer.json`, `contao/composer.lock` | Forked Core used by forum fork; public assets symlinked | Decide whether Core fork survives; avoid dual core |
| `con4gis/core` v7.1.7 | `contao/composer.lock` | Transitive through Groups/Projects | Runtime deletes `vendor/con4gis/core` in `Dockerfile:58`; unresolved packaging hazard |
| `con4gis/groups` v2.8.6 | `contao/composer.lock`; `forum:src/ContaoManager/Plugin.php`, `ProfilePageModuleController.php` | Forum uses Groups member model and bundle load order | Keep; validate compatibility with upstream 5.x |
| `con4gis/projects` v4.0.41 | `contao/composer.lock`; `forum:src/Classes/C4GForumNotification.php`, `PMModuleController.php`, `C4GForum.php`, `C4GForumBreadcrumb.php` | Notification base class and jQuery GUI | Keep; validate 5.x requirement |
| `terminal42/notification_center` 1.6.18 | `contao/composer.lock` | Installed transitively via `con4gis/projects` | Required for forum subscription/PM notifications |
| Contao `4.13.*` | `contao/composer.json` | Application runtime | Upstream 5.x compatibility must be checked, not assumed |
| PHP `>=8.5.0` | `contao/composer.json` | Application image | Forked bundles still declare `^7.4 || ^8.0` |

Container wiring:

| Path | Evidence | Purpose |
| --- | --- | --- |
| `packages/core` → `vendor/kaibuecking/core` | `docker-compose.override.yaml:4` | Local Core working copy |
| `packages/forum` → `vendor/kaibuecking/forum` | `docker-compose.override.yaml:5` | Local Forum working copy |
| `${FILES_VOLUME}/forum` → `files/forum` | `docker-compose.yaml:53` | Production Forum assets |
| `./contao/files/forum` → `files/forum` | `docker-compose.yaml:83` | Local Forum JS/CSS overlay |
| `${FILES_VOLUME}/uploads` → `files/uploads` | `docker-compose.yaml:48` | Uploaded images/files |
| `${FILES_VOLUME}/userimages` → `files/userimages` | `docker-compose.yaml:50` | Avatars |
| `vendor/kaibuecking/core/src/Resources/public/` → `web/bundles/con4giscore` | `Dockerfile:69` | Core public assets |
| `run-cron.sh` → `contao-console contao:cron` | `docker-compose.yaml:90`, `run-cron.sh`, `cron/{dev,prod}/crontab` | Runs cleanup cron jobs |

## 2. Direct Application Code References

| Reference | File/location | Behavior or data touched |
| --- | --- | --- |
| `C4GForumHelper::getAvatarByMemberId()` | `contao/templates/member_myview.html5`, `member_view.html5`, `member_edit.html5`, `member_grouped.html5`, `mod_login.html5`, `forum_user_data.html5` | Reads `tl_member.memberImage`, resolves avatar image |
| `C4GForumHelper::getDateTimeString()` | `contao/system/modules/sensiquemodule/templates/mod_sensique_subscriptions.html5` | Formats thread creation date |
| `ForumController::getMessageCount()` | `contao/templates/mod_login.html5` | Unread PN count from `tl_c4g_forum_pn` |
| `C4gForumSession::getOnlineStatusByMemberId()` | `contao/system/modules/sensiquemodule/ModuleSensiqueMessages.php` | Online status for conversation list |
| `C4gForumPn::create()` / `send()` | `contao/system/modules/sensiquemodule/ModuleSensiqueRegistration.php` | Creates welcome/moderation PNs and calls `send()` |
| `tl_c4g_forum_pn` | `ModuleSensiqueMessages.php`, `ModuleSensiqueSubscriptions.php` (indirectly), `ModuleSensiqueRegistration.php` | Conversation list, unread count, welcome PNs |
| `tl_c4g_forum_thread` | `ModuleSensiqueArticle.php`, `ModuleSensiqueSubscriptions.php`, cron job | Author articles, subscriptions, orphan cleanup |
| `tl_c4g_forum_thread_subscription` | `ModuleSensiqueSubscriptions.php`, `contao/system/modules/cron/jobs/deleteUnreferencedSubscriptions.php` | Subscription listing and orphan deletion |
| `tl_c4g_forum_subforum_subscription` | `contao/system/modules/cron/jobs/deleteUnreferencedSubscriptions.php` | Orphan deletion |
| `tl_c4g_forum_post` | `ModuleSensiqueArticle.php`, `ModuleSensiqueSubscriptions.php` | First-post text used as article preview |
| `tl_member` | `ModuleSensiqueArticle.php`, `ModuleSensiqueSubscriptions.php`, `ModuleSensiqueRegistration.php`, member templates | Author names, avatars, recipient selection |
| `/forum.html?state=forum:<id>;readthread:<id>` | `nav_default_bootstrap.html5`, `mod_sensique_article.html5`, `mod_sensique_subscriptions.html5`, `ModuleSensiqueRegistration.php` | Deep links into forum categories/threads |
| `/Nachrichten.html?username=…` | `mod_login.html5`, `forum_user_data.html5`, `member_view.html5`, `ModuleSensiqueRegistration.php`, `mod_sensique_messages.html5` | Personal-message entry point |
| `con4gis/forumPnService/de/*` | `contao/files/privateChat/js/privateChat.js` | Custom PN actions (`contact`, `messages`, `markAll`, `send`) |
| `bundles/con4gisforum/dist/js/c4g.pn.js` | `contao/templates/forum_user_data.html5` | Forum PN client script |
| `files/forum/js/forum.js?6` | `contao/templates/mod_c4g_forum.html5` | Forum UI patching (Bootstrap classes, buttons) |
| `files/privateChat/js/privateChat.js` and `privateChatReceiver.js` | `contao/system/modules/sensiquemodule/templates/mod_sensique_messages.html5` | Private chat and Socket.IO realtime |
| `$GLOBALS['TL_LANG']['C4G_FORUM']['DELETED_USER']` | `ModuleSensiqueArticle.php`, `ModuleSensiqueSubscriptions.php` | Deleted-author label; fork changed this key to `DISCUSSIONS` in `490a475` |
| `$GLOBALS['TL_LANG']['C4G_FORUM']['DISCUSSION']` keys | `forum_user_data.html5`, app templates | Post count, PN label, social links |

## 3. Application Modules and Hooks

| Module/class | File | Forum dependency |
| --- | --- | --- |
| `ModuleSensiqueMessages` | `contao/system/modules/sensiquemodule/ModuleSensiqueMessages.php` | Direct SQL over `tl_c4g_forum_pn`; `C4gForumSession`; unread counts |
| `ModuleSensiqueSubscriptions` | `contao/system/modules/sensiquemodule/ModuleSensiqueSubscriptions.php` | Direct SQL over thread/subscription/post/member tables; pagination limit 10 |
| `ModuleSensiqueArticle` | `contao/system/modules/sensiquemodule/ModuleSensiqueArticle.php` | Direct SQL over thread/post/member tables; pagination limit 10 |
| `ModuleSensiqueRegistration` | `contao/system/modules/sensiquemodule/ModuleSensiqueRegistration.php` | Creates PNs for new members and all active members; sender id `818`; subjects `Willkommensnachricht` and `Neues Mitglied` |
| `deleteUnreferencedSubscriptionsCron` | `contao/system/modules/cron/jobs/deleteUnreferencedSubscriptions.php` | Deletes subscriptions whose `member` no longer exists in `tl_member` |
| Frontend module registration | `contao/system/modules/sensiquemodule/config/config.php` | Registers `SensiqueArticle`, `SensiqueSubscriptionModels`, `SensiqueMessages`, and other SensIQue modules |
| Member DCA | `contao/system/modules/sensiquemodule/dca/tl_member.php` | Adds `forum_member_legend` with `memberImage`, `memberSignature`, `memberPosts`, social fields; `groups` palette |
| Member language data | `contao/system/modules/sensiquemodule/languages/de/tl_member.php` | Forum category labels |

No application PHP code directly references `con4gis\GroupsBundle` or `con4gis\ProjectsBundle`. Those are Forum-bundle dependencies. The application does use member group `6` for administrative navigation (`mod_login.html5`), which is a group-data assumption rather than a Forum API.

## 4. Templates, Frontend Assets, and Overrides

| Asset | Type | Behavior |
| --- | --- | --- |
| `contao/templates/forum_user_data.html5` | Application override of forum partial | Custom profile links, avatar fallback, hidden post-count element, PN link to `/Nachrichten.html` |
| `contao/templates/mod_c4g_forum.html5` | Application override | Loads `files/forum/js/forum.js?6`; initializes `c4g.projects.c4gGui` |
| `contao/templates/nav_default_bootstrap.html5` | Application template | Forum category deep links and logged-out anchors |
| `contao/templates/mod_login.html5` | Application template | Avatar helper and PN unread badge via forum controller |
| `contao/templates/member_{myview,view,edit,grouped}.html5` | Application templates | Avatar helper usage |
| `contao/files/forum/js/forum.js` | Application asset | Patches forum markup after AJAX; depends on `con4gis/api/c4g_forum_ajax` |
| `contao/files/forum/css/forum.css` | Application asset | SensIQue forum styling and responsive PN button |
| `contao/system/modules/sensiquemodule/templates/mod_sensique_messages.html5` | Application module template | Chat UI; Socket.IO; exposes `FE_USER_AUTH` cookie to JS |
| `contao/system/modules/sensiquemodule/templates/mod_sensique_subscriptions.html5` | Application module template | "Lieblingsartikel"; `C4GForumHelper` avatar/date; forum deep links |
| `contao/system/modules/sensiquemodule/templates/mod_sensique_article.html5` | Application module template | "Meine Artikel"; forum deep links |
| `contao/files/privateChat/js/*` | Application assets | Calls custom PN API; Socket.IO client with `FE_USER_AUTH` |
| `node_socket/` | Application service | Realtime PN delivery; ports `4200`/`4201` via `localconfig.php` |

## 5. Persisted Data (Schema-Level, No Records)

| Table | Role | Key relationships |
| --- | --- | --- |
| `tl_c4g_forum` | Forums/subforums, permissions, settings | `pid` parent; member/admin group IDs; upload/notification module config lives partly in `tl_module` |
| `tl_c4g_forum_thread` | Threads/articles | `pid` → forum; `author` → `tl_member`; `last_post_id` → post |
| `tl_c4g_forum_post` | Posts/comments | `pid` → thread; `author` → member; `post_number = 1` is the first post |
| `tl_c4g_forum_pn` | Personal messages | `sender_id`/`recipient_id` → member; `status` unread flag |
| `tl_c4g_forum_upload` | Forum upload records | `fileUuid` → `tl_files.uuid` |
| `tl_c4g_forum_thread_subscription` | Thread subscriptions | `pid` → thread; `member` → member |
| `tl_c4g_forum_subforum_subscription` | Subforum subscriptions | `pid` → forum; `member` → member |
| `tl_c4g_forum_thread_translations` | Thread translations | Thread relation |
| `tl_c4g_forum_search_index`, `tl_c4g_forum_search_word`, `tl_c4g_forum_search_last_index` | Search index | Derived data; rebuildable |
| `tl_c4g_forum_build_index` | Index build state | Derived data |
| `tl_c4g_forum_post_reaction` | Post reactions | Post/member relation |
| `tl_files` | Contao files registry | UUID/path used by uploads and avatars |
| `tl_member` | Members | `memberImage`, `memberSignature`, `memberPosts`, `groups`, `username` |
| `tl_member_group` | Groups | Forum member/admin group foreign keys |
| `tl_module` | Frontend modules | Forum/subscription modules; `sub_*`, `mail_new_pm`, `new_pm_redirect`, upload folder settings |
| `tl_nc_notification`, `tl_nc_message`, `tl_nc_language`, `tl_nc_gateway`, `tl_nc_registration` | Notification Center | Types, messages, per-language content, gateway, registration |

## 6. Notification Center Wiring

Forum bundle registers notification type group `con4gis Forum` with seven types:

| Type | Trigger | Tokens |
| --- | --- | --- |
| `sub_new_thread` | New thread in subscribed forum | `admin_email`, `threadname`, `forumname`, plus subscriber/unsubscribe tokens |
| `sub_deleted_thread` | Deleted thread | Same as above |
| `sub_moved_thread` | Moved thread | Same as above |
| `sub_new_post` | New post | Same plus `post_title` |
| `sub_deleted_post` | Deleted post | Subscriber/unsubscribe tokens |
| `sub_edited_post` | Edited post | Subscriber/unsubscribe tokens |
| `mail_new_pm` | New personal message | `admin_email`, `user_name`, `user_email`, `responsible_username`, `link`, `message`, `subject` |

Evidence:

- `forum:src/Resources/contao/config/config.php` registers `$GLOBALS['NOTIFICATION_CENTER']['NOTIFICATION_TYPE']['con4gis Forum']`.
- `forum:src/Classes/C4GForumNotification.php` defines the seven type constants and token lists.
- `forum:src/Classes/C4GForumSubscription.php` reads module fields `sub_new_thread`, `sub_deleted_thread`, `sub_moved_thread`, `sub_new_post`, `sub_deleted_post`, `sub_edited_post`, calls `C4GForumNotification`, and sends via Notification Center.
- `forum:src/Controller/ForumController.php` sends `mail_new_pm` after the custom PM `send` action.
- `forum:src/Resources/contao/dca/tl_module.php` defines `sub_*`, `mail_new_pm`, `new_pm_redirect`, and foreign keys to `tl_nc_notification.title`.
- The application has no own Notification Center registration or PHP configuration; NC is present only transitively and its actual configuration is database state.

Customized behavior to verify: `forum:src/Resources/contao/models/C4gForumPn.php::send()` no longer calls the legacy `notifyRecipient()` after commit `d0fa1a9`. Registration PNs call `send()`, so they are saved without that legacy email. The custom `/forumPnService/.../send` path sends the NC `mail_new_pm` notification. Ensure the port does not produce zero or duplicate emails.

## 7. Permissions and Groups

- `tl_c4g_forum.member_groups` and `tl_c4g_forum.admin_groups` are foreign keys to `tl_member_group.name`.
- Application member DCA exposes `groups` under `groups_legend` and forum profile fields under `forum_member_legend`.
- `mod_login.html5` checks `isMemberOf(6)` for member/invoice administration; this is group-data usage that must survive the member/group migration.
- Forum bundle load order depends on `con4gisGroupsBundle` (`forum:src/ContaoManager/Plugin.php`).

## 8. Data-Dependent Constants Found in Code

| Constant | Location | Risk |
| --- | --- | --- |
| Forum category IDs `1`, `5`–`18` | `nav_default_bootstrap.html5` | Links break if forum IDs change |
| Thread IDs `86`, `87` | `ModuleSensiqueRegistration.php` | Welcome message links break if threads are recreated |
| Moderator sender ID `818` | `ModuleSensiqueRegistration.php` | Foreign-key failure or wrong sender if member is not migrated |
| Subjects `Willkommensnachricht`, `Neues Mitglied` | `ModuleSensiqueMessages.php`, `ModuleSensiqueRegistration.php` | Special message rendering and template assumptions |
| Upload folder `/files/uploads/images/` | `core:src/Resources/public/vendor/imgUpload.php` after `634ba637` | Legacy editor uploads may bypass Contao file registry |
| Avatar folder `files/userimages/user_<id>` | `forum:src/Resources/contao/dca/tl_member.php`, `Avatar.php` | Avatar files and `tl_member.memberImage` must stay aligned |
| Member group ID `6` | `contao/templates/mod_login.html5` (`isMemberOf(6)`); member DCA `groups` palette | Member/invoice administration links and permission checks break if the group ID changes |

## 9. Groups/Projects Boundary

- `con4gis/groups`: Forum uses `MemberModel` in `ProfilePageModuleController` and bundle load order.
- `con4gis/projects`: Forum uses `C4GNotification` as the Notification Center base class and `C4GJQueryGUI` in the PM module, forum module, and breadcrumb.
- The application does not call Groups/Projects directly. A forum port that drops those requirements must replace these behaviors or keep the dependencies; that is a #3 decision, not an inventory assumption.

## 10. Validation Evidence And Reproducibility Boundary

- `openspec validate issue-1-inventory-forum-usage-custom-fork-behavi --type change --strict --json --no-interactive` passes with zero issues.
- The writable repository materialized for this change is the Core fork `kaibuecking/corebundle`, not the SensIQue application. Its `origin/customfeaturesV2` is `bf42aa097419568b3eedeb658616a74c6a7a7194`, `main` is `0988a61e`, and the merge base is `5134d621db4ae0caa4ec0c39f72cb7ae04817f90`. Exactly three non-merge commits exist beyond `main`: `e734e471`, `634ba637`, `bf42aa09`. Re-reading those diffs confirms the Core rows in `delta-matrix.md`: package rename, dialog/uploader changes, and the version-provider guard.
- A re-run of the Forum/con4gis reference searches against `bf42aa09` finds no Forum bundle classes (`C4GForum`), notification types (`con4gis Forum`), PN endpoints (`forumPnService`), or `tl_c4g_forum*` tables under `src/`. The only Forum-related code coupling is the legacy editor session keys `c4g_forum_bbcodes_editor_*` read by `src/Resources/public/vendor/imgUpload.php` and `src/Classes/C4GFileUpload.php`, which is the uploader coupling already classified `relocate` in `delta-matrix.md`. `src/Resources/public/images/be-icons/forum_c4g.svg` is an unrelated icon. This confirms the Core-fork boundary in section 9 and the uploader dependency noted in section 8.
- The SensIQue application and `packages/forum` are not present in this writable repository, so their reference searches, submodule pins, lock entries, and `.gitmodules` evidence cannot be re-executed here. Those entries are the approved baseline analysis in sections 1–9; re-confirmation is tracked as blocked in `tasks.md` items 6.1, 6.2, and 7.1, with the operator procedures in `data-inventory-checklist.md` and `known-unknowns.md`.
- No production records, exports, filenames, credentials, database dumps, or attachment files are included in this change.

## 11. Re-verified Pins And Reference Searches (2026-10-26)

Re-executed from an authorized environment with read access to the application and both forks. The
writable workspace of this change still contains only the Core fork; these searches were run against
the pinned revisions named below, not against an approximate checkout.

### Pin confirmation (tasks 6.2)

| Source | Value |
| --- | --- |
| `kaibuecking/sensique@master` | `b6ff330b66c37349c299028138433c2a764e2bde` |
| `.gitmodules` `packages/core` | `https://github.com/kaibuecking/CoreBundle.git` |
| `.gitmodules` `packages/forum` | `https://github.com/kaibuecking/ForumBundle.git` |
| submodule gitlink `packages/core` | `bf42aa097419568b3eedeb658616a74c6a7a7194` |
| submodule gitlink `packages/forum` | `490a475baacc4610e10d3e77daa96acf182b50ca` |
| `contao/composer.lock` `kaibuecking/core` | `dev-customfeaturesV2` `bf42aa09…` |
| `contao/composer.lock` `kaibuecking/forum` | `dev-customfeaturesV2` `490a475b…` |
| `kaibuecking/CoreBundle@customfeaturesV2` | `bf42aa09…` |
| `kaibuecking/ForumBundle@customfeaturesV2` | `490a475b…` |

The submodule gitlinks, the lock references and both fork branch heads agree, and the pinned commits
exist in the forks and in the `Kuestenschmiede` copies of the same histories. There is no pin drift.

Other locked `con4gis` packages: `con4gis/core` `v7.1.7` `f840cbd8…`, `con4gis/groups` `v2.8.6`
`f599b90d…`, `con4gis/projects` `v4.0.41` `0bb2c217…`.

### Forum reference searches (tasks 6.1), at the pinned commit `490a475b`

- 79 PHP files under `src/`.
- Tables (14): `tl_c4g_forum`, `_build_index`, `_pn`, `_post`, `_post_reaction`, `_reaction`,
  `_search_index`, `_search_last_index`, `_search_word`, `_subforum_subscription`, `_thread`,
  `_thread_subscription`, `_thread_translations`, `_upload`.
- Notification Center coupling: `src/Classes/C4GForumNotification.php`, `notificationIDs`,
  `NOTIFICATION_TYPE`, `NOTIFICATION_CENTER`.
- Templates (16): `be_tag_widget`, `c4g_forum_subscription_dialog_forum`,
  `c4g_forum_subscription_dialog_thread`, `c4g_subscription`, `forum_sitemap`, `forum_user_data`,
  `member_grouped`, `modal_compose`, `modal_inbox`, `modal_view_message`, `mod_c4g_forum`,
  `mod_c4g_forum_breadcrumb`, `mod_c4g_forum_plainhtml`, `mod_c4g_forum_pncenter`,
  `mod_c4g_forum_profile_page`, `mod_c4g_forum_subscriptions`.
- Uploader: `src/Classes/C4gForumSingleFileUpload.php`, the Forum-side uploader tracked as U6.
- Personal-message surface: `tl_c4g_forum_pn` with `mod_c4g_forum_pncenter`, `modal_inbox` and
  `modal_view_message`.

### Application reference searches (tasks 6.1), `sensique@master b6ff330b`

- `con4gis` appears in exactly two application classes:
  `contao/system/modules/sensiquemodule/ModuleSensiqueRegistration.php` and
  `ModuleSensiqueMessages.php`.
- Application-owned forum tables: `tl_c4g_forum_pn`, `tl_c4g_forum_post`,
  `tl_c4g_forum_subforum_subscription`, `tl_c4g_forum_thread`, `tl_c4g_forum_thread_subscription`.
- No application symbol matching `pn_*` was found, so a claim about production endpoint traffic still
  needs the operator evidence of U5 rather than a code reading.

### Remaining boundary

Upstream `con4gis/forum` is not reachable from this environment: the repository and the organisation
answer `404` for the identity used here. U1 (tasks 7.1) therefore stays open, as do 7.2, 7.3 and 7.5,
which need a restored database and production evidence, and 7.4, which needs owner decisions.

## 12. U1 Upstream Classification Against Forum `v5.0.6` (2026-10-27)

The upstream repositories were renamed: `con4gis/*` is now `Kuestenschmiede/*`. With that, `v5.0.6`
is available as `Kuestenschmiede/ForumBundle` tag `v5.0.6` = `f125d30cd6ef68744f61d6043a239f9e1ab601ce`
(2026-09-03), merge base with `customfeaturesV2` `9a61ac24`.

Upstream `v5.0.6` requires `php ^8.0`, `contao/core-bundle ^5.3`, `con4gis/core ^8`,
`con4gis/groups ^2.10`, `con4gis/projects ^5`. The application currently locks `con4gis/core v7.1.7`,
`con4gis/groups v2.8.6`, `con4gis/projects v4.0.41`, so the migration crosses a core major and a
Contao major — U11 is answered as "core 8.x", not "core 7.1.7".

Patch-equivalence (`git cherry v5.0.6 customfeaturesV2`) marks all 11 commits `+`, which is expected
across a major rewrite; the classification below therefore compares the recorded behaviour with the
`v5.0.6` source rather than commit identity.

### Forum fork commits

| # | Commit | U1 verdict | Evidence in `v5.0.6` |
| --- | --- | --- | --- |
| 1 | `f342b92` | `obsolete` | Fork-only package rename |
| 2 | `36954ac` | `obsolete` | Empty `testfile` |
| 3 | `d0fa1a9` | split, see below | Mixed custom behaviours |
| 4 | `8c1e000` | `upstreamed` | `C4GForumSubscription` guards `MemberModel::findByPk` for null (lines 184–186, 208–209) |
| 5 | `2a5324c` | `likely upstreamed` (verify on port) | `C4gForumMember::getAvatarByMemberId` guards missing member/`numRows`; the PHP 8 `is_array` hardening is widespread upstream |
| 6 | `d3a1f61` | `retain` | No first-post-at-top query upstream |
| 7 | `1aae5f3` | `retain` | No `first`/`follow` discriminator upstream |
| 8 | `0359a37` | `retain` | Follows the retained UNION construction |
| 9 | `7e9c9cc` | `retain` | Follows the retained UNION construction |
| 10 | `a90040d` | `retain` | Follows the retained UNION construction |
| 11 | `490a475` | split, see below | PHP 8 hardening plus one obsolete key change |

### Per-behaviour checks

| Behaviour | Verdict | `v5.0.6` evidence |
| --- | --- | --- |
| `getTicketTitle` plain thread title | `retain` | Upstream still builds `[Type #0042] name` plus ticket state |
| `notifyRecipient` suppression | `retain` | Upstream still calls `$this->notifyRecipient(...)` (line 397, with a TODO) |
| Legacy PN auth (`FE_USER_LOGGED_IN`, `FE_USER_AUTH` cookie) | `obsolete` | `ForumController::personalMessageAction(Request, …)` is framework-based; the legacy constants are gone |
| New PN actions (`markAll`, `messages`, `contact`) | `retain` | Not present upstream |
| First post pinned at the top (UNION + `post_number != 1`) | `retain` | Upstream has only `title_first_post`/`body_first_post` tooltips |
| `DELETED_USER` key `DISCUSSION` → `DISCUSSIONS` | `obsolete` | Upstream still uses `['DISCUSSION']['DELETED_USER']`; do not port the divergence |
| PHP 8 null guards (member, tree, history) | `retain` (partly covered) | Upstream has broad `is_array` hardening, but not these module paths |
| Language labels, `forum_user_data`, `c4gForum.css` | `relocate` (#4) | Presentation ownership stays with the application |

### Core fork commits against `Kuestenschmiede/CoreBundle v8.0.26`

| # | Commit | U1 verdict | Evidence |
| --- | --- | --- | --- |
| 1 | `e734e471` | `obsolete` | Fork-only package rename |
| 2 | `634ba637` | `relocate` (#4), still relevant | `src/Resources/public/vendor/imgUpload.php` and `src/Resources/public/src/js/DialogHandler.js` still exist in `v8.0.26` |
| 3 | `bf42aa09` | `retain` | `C4GVersionProvider::fetchLatestVersion` still expands `$arrJson['packages'][$package]` without an existence guard |

### What this changes

`known-unknowns.md` U1 moves from "unknown" to the table above. The remaining open items are the
owner decisions D1–D10 (7.4) and the operator evidence of 7.2/7.3/7.5; no upstream tag is missing
anymore.
