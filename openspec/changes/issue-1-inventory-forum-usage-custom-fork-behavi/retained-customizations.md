# Retained Customization List for #3 and #4

This is the exact porting backlog derived from the inventory. “Retain” means the observable behavior must survive. “Relocate” means the behavior survives but should not live in the narrow fork. “Drop” means do not port.

## #3 — Narrow Forum Fork Port (based on upstream con4gis/forum 5.x)

### Retain: first post pinned at the top

- Source commits: `d3a1f61`, `1aae5f3`, `0359a37`, `7e9c9cc`, `a90040d`.
- Files/functions: `src/Classes/C4GForumHelper.php`, `getPostsForThread()` / post query builder.
- Required behavior:
  - The thread's `post_number = 1` post is returned first.
  - Subsequent posts retain their configured order.
  - The single-post branch uses the thread id (`a.pid`), not the post id, when resolving the first post.
  - Bindings and `WHERE`/`UNION ALL` construction must be valid for both thread and single-post calls.
  - Missing first posts must not crash the query; see the data check for threads without a first post.
- Verification: open a thread with at least three posts; first post is first; follow-up order is unchanged; open a single post by id; no SQL error.

### Retain: first-post presentation rules

- Source commits: `d0fa1a9`, `490a475`.
- Files/functions: `src/Resources/contao/modules/C4GForum.php` post header rendering.
- Required behavior:
  - Do not render the delete action for the first post.
  - Header post numbering/count reflects the first post separately from replies.
  - Existing Bootstrap button markup used by SensIQue is preserved or replaced by an application-owned equivalent.
  - `$GLOBALS['first_post']` global state must not leak across threads or AJAX requests; replace it with request-local state if the 5.x renderer allows.
- Verification: first post has no delete action; replies have delete actions according to permissions; navigating between threads does not misnumber the first reply.

### Retain: custom personal-message service behavior

- Source commit: `d0fa1a9`.
- Files/functions: `src/Controller/ForumController.php` (`personalMessageAction`, `getMessages`, `getContactbyId`, `getContactbyUsername`, `getMessageCount`, `markAllMessages`), `src/Resources/config/routing.yml` (`forum_pn`).
- Required behavior:
  - `POST /con4gis/forumPnService/{language}/send` stores a PN with subject `Nachricht` when the client does not supply a subject; returns `success` and the decoded message.
  - `GET /con4gis/forumPnService/{language}/messages` returns the conversation for sender/recipient with the existing 5-message self-conversation and 500-message pair behavior.
  - `GET /con4gis/forumPnService/{language}/contact` resolves a contact by numeric id or username prefix, limited to five results, and includes avatar plus online status.
  - `GET /con4gis/forumPnService/{language}/markAll` marks the recipient's messages from the sender as read and returns the remaining unread count.
  - Authentication rejects requests without a logged-in frontend user and the `FE_USER_AUTH` cookie.
  - `ForumController::getMessageCount()` remains publicly callable by the login template.
- Verification: use the private chat to send, load, search, and mark messages; unread badge updates; requests without the auth cookie are rejected.

### Retain: personal-message notification behavior

- Source commit: `d0fa1a9`.
- Files/functions: `src/Resources/contao/models/C4gForumPn.php::send()`, `src/Controller/ForumController.php` `send` action.
- Required behavior:
  - The custom PM endpoint sends exactly one Notification Center `mail_new_pm` notification per sent message.
  - The legacy `C4gForumPn::notifyRecipient()` path stays disabled or is replaced so it cannot double-send.
  - Registration welcome PNs (`C4gForumPn::create(...)->send(...)`) must not unexpectedly e-mail after the port unless the product owner explicitly wants it.
- Verification: send one PM between two test members; exactly one NC message is produced; send a welcome PN through registration; confirm the intended email behavior.

### Retain: subscription orphan guard

- Source commit: `8c1e000`.
- File/function: `src/Classes/C4GForumSubscription.php`, subscriber collection for a thread.
- Required behavior: a subscription referencing a deleted `tl_member` is skipped instead of constructing a null-member `Subscription`.
- Verification: create an orphan subscription in a test copy; forum notification run does not fatal; the app cron cleanup remains safe.

### Retain: PHP 8 and null-safety guards

- Source commits: `2a5324c`, `490a475`, plus relevant `d0fa1a9` null handling.
- Files/functions: `C4GForumHelper::getAvatarByMemberId()`, `C4GForum.php` user-data rendering, `C4gForumMember::getAvatarByMemberId()`, `C4GForum.php` request parsing.
- Required behavior:
  - Empty/non-array avatar data returns `null`, not a PHP warning/fatal.
  - Missing members render an empty/deleted-user state instead of accessing null properties.
  - Missing `edit_last_author` and avatar paths are tolerated.
  - `historyreq` and forum tree parameters are optional.
- Verification: render a thread whose author was deleted and whose avatar is empty; no warnings; deleted-user label appears.

### Retain: ticket/title simplification

- Source commit: `d0fa1a9`.
- File/function: `src/Classes/C4GForumHelper.php`, `getTicketTitle()`.
- Required behavior: forum thread titles are the thread name (plus optional time), without the `[TYPE #0000]` prefix and without ticket state decoration.
- Verification: thread list and notification links show the plain thread name.

### Relocate from the fork: language and presentation

- Source commits: `d0fa1a9`, `490a475`.
- Items: “Kommentieren”, “Thementitel bearbeiten”, “Speichern”, comment header wording, non-breaking spaces, hiding the subject in the delete warning, PN compose icon, `forum_user_data.html5` partial, `c4gForum.css`.
- Target: application language overrides, `contao/templates/forum_user_data.html5`, and `contao/files/forum/css/forum.css`.
- Required behavior: visible SensIQue wording and layout remain, but the fork diff does not carry presentation files.
- Do not retain: the `DELETED_USER` key change from `DISCUSSION` to `DISCUSSIONS`; application templates read `DISCUSSION`. Correct this during the port.

### Drop from the fork

- `f342b92` and `e734e471`: package renames to `kaibuecking/*`. Use upstream package requirements and application-level pinning instead.
- `36954ac`: empty test file.
- The `composer.json` hunk of `d0fa1a9`.
- The dual-core workaround as a long-term design: do not keep both `con4gis/core` and `kaibuecking/core` unless a documented, reviewed reason remains.

### Upstream-verification candidates (do not drop yet)

- `2a5324c` avatar guard.
- `490a475` PHP 8 null guards and array initialization.
- `bf42aa09` Core version provider guard.
- Reclassify as `upstreamed` only after comparing with the real `v5.0.6` (and matching Core version).

## #4 — Application Integration, Notification Center, and Data

### Retain in application code

| Item | Location | Required behavior |
| --- | --- | --- |
| Forum layout override | `contao/templates/forum_user_data.html5` | Profile/avatar links, default avatar, PN link, hidden post-count element |
| Forum module override | `contao/templates/mod_c4g_forum.html5` | Loads `files/forum/js/forum.js?6`; initializes `c4g.projects.c4gGui` |
| Forum JS patches | `contao/files/forum/js/forum.js` | Bootstrap classes, buttons, subject removal after AJAX |
| Forum CSS | `contao/files/forum/css/forum.css` | SensIQue layout/responsive rules |
| Navigation links | `contao/templates/nav_default_bootstrap.html5` | Category links `forum:1`, `forum:5`–`forum:18` |
| Member templates | `member_myview`, `member_view`, `member_edit`, `member_grouped` | Avatar helper usage |
| Login template | `contao/templates/mod_login.html5` | Avatar, group-6 admin links, PN unread badge |
| Messages module | `ModuleSensiqueMessages.php` + template | Conversation list, unread count, online status |
| Subscriptions module | `ModuleSensiqueSubscriptions.php` + template | “Lieblingsartikel”, 10-per-page, first-post preview |
| Articles module | `ModuleSensiqueArticle.php` + template | “Meine Artikel”, 10-per-page, first-post preview |
| Registration PNs | `ModuleSensiqueRegistration.php` | Welcome message to new member and “new member” messages to active members |
| Subscription cleanup | `contao/system/modules/cron/jobs/deleteUnreferencedSubscriptions.php` | Deletes subscriptions with missing members |
| Private chat | `mod_sensique_messages.html5`, `privateChat.js`, `privateChatReceiver.js` | Custom PN API, Socket.IO, `FE_USER_AUTH` handshake |
| Member profile fields | `contao/system/modules/sensiquemodule/dca/tl_member.php` | `memberImage`, `memberSignature`, `memberPosts`, social links, groups |

### Retain only as data/config, not code

- Forum category IDs `1`, `5`–`18`.
- Welcome threads `86` and `87`.
- Moderator sender ID `818`.
- Subjects `Willkommensnachricht` and `Neues Mitglied`.
- Notification Center type group `con4gis Forum` with the seven types and token lists.
- Forum module notification fields (`sub_*`, `mail_new_pm`, `new_pm_redirect`) and their `tl_nc_notification` references.
- Upload folders and avatar folders.
- Member/admin group assignments for forums.

### Relocate or decide

- Core `DialogHandler.js` close-icon change: move to an application asset override if still desired.
- Core `imgUpload.php` hardcoded `/files/uploads/images/` and URL output: move to the application uploader or drop if the legacy CKEditor uploader is no longer used; determine usage first.
- `C4GVersionProvider` guard: retain until upstream Core is proven to contain it.
- Notification Center configuration: treat as an operator-owned migration, not part of the code port.

### Drop or avoid

- Do not automatically activate Notification Center in this change.
- Do not migrate data in this change.
- Do not keep the image deletion of `vendor/con4gis/core` as the permanent resolution for the dual-core problem.
- Do not copy production records or attachments into Git.
