# Operator-Safe Data Inventory Checklist

Use this checklist only against a **restored, anonymized copy** of the production database. Never commit query output, dumps, filenames, message text, usernames, e-mail addresses, or attachment files. Record only aggregate counts, booleans, IDs, and relationship results in the follow-up issue or another non-public operational record.

## 0. Preconditions

- [ ] Restore the database into an isolated, non-production environment.
- [ ] Use a read-only database user. Do not run `UPDATE`, `DELETE`, `ALTER`, or migration commands.
- [ ] Confirm the copy is anonymized before running any content-bearing query.
- [ ] Confirm no `.env`, credentials, database dump, or attachment file is inside the Git working tree.
- [ ] Record only aggregate results; do not paste rows containing personal data into Git.

Suggested anonymization (perform on the restored copy, not production):

- Replace `tl_member.username`, `firstname`, `lastname`, `email`, `phone`, `street`, `postal`, `city`, and `memberImage` path components with stable pseudonyms that preserve uniqueness.
- Replace `tl_c4g_forum_post.subject`, `tl_c4g_forum_post.text`, `tl_c4g_forum_pn.subject`, and `tl_c4g_forum_pn.message` with fixed placeholders.
- Replace filename components in `tl_files.path` while preserving the directory prefix and extension.
- Keep IDs, foreign keys, `status`, timestamps, published flags, and group IDs so relationship checks still work.
- Do not copy attachment files; count them only.

## 1. Schema Presence

```sql
SELECT TABLE_NAME
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN (
    'tl_c4g_forum',
    'tl_c4g_forum_thread',
    'tl_c4g_forum_post',
    'tl_c4g_forum_pn',
    'tl_c4g_forum_upload',
    'tl_c4g_forum_thread_subscription',
    'tl_c4g_forum_subforum_subscription',
    'tl_c4g_forum_thread_translations',
    'tl_c4g_forum_search_index',
    'tl_c4g_forum_search_word',
    'tl_c4g_forum_search_last_index',
    'tl_c4g_forum_build_index',
    'tl_c4g_forum_post_reaction',
    'tl_files',
    'tl_member',
    'tl_member_group',
    'tl_module',
    'tl_nc_notification',
    'tl_nc_message',
    'tl_nc_language',
    'tl_nc_gateway',
    'tl_nc_registration'
  )
ORDER BY TABLE_NAME;
```

- [ ] Record which expected tables are missing. Missing search/reaction tables may be acceptable if the feature is unused; missing subscription, PN, upload, or NC tables is a blocker.

## 2. Row Counts (Aggregates Only)

```sql
SELECT 'tl_c4g_forum' AS entity, COUNT(*) AS row_count FROM tl_c4g_forum
UNION ALL SELECT 'tl_c4g_forum_thread', COUNT(*) FROM tl_c4g_forum_thread
UNION ALL SELECT 'tl_c4g_forum_post', COUNT(*) FROM tl_c4g_forum_post
UNION ALL SELECT 'tl_c4g_forum_pn', COUNT(*) FROM tl_c4g_forum_pn
UNION ALL SELECT 'tl_c4g_forum_upload', COUNT(*) FROM tl_c4g_forum_upload
UNION ALL SELECT 'tl_c4g_forum_thread_subscription', COUNT(*) FROM tl_c4g_forum_thread_subscription
UNION ALL SELECT 'tl_c4g_forum_subforum_subscription', COUNT(*) FROM tl_c4g_forum_subforum_subscription
UNION ALL SELECT 'tl_c4g_forum_thread_translations', COUNT(*) FROM tl_c4g_forum_thread_translations
UNION ALL SELECT 'tl_c4g_forum_post_reaction', COUNT(*) FROM tl_c4g_forum_post_reaction;
```

- [ ] Record counts by table and by `tl_c4g_forum_thread_subscription.pid`/`member` distinct counts only.
- [ ] Do not select message text or member identifiers for the record.

## 3. Relationship and Orphan Checks

Each query returns a count only.

```sql
-- Threads without a forum
SELECT COUNT(*) AS orphan_threads
FROM tl_c4g_forum_thread t
LEFT JOIN tl_c4g_forum f ON f.id = t.pid
WHERE f.id IS NULL;

-- Threads with a missing author
SELECT COUNT(*) AS threads_missing_author
FROM tl_c4g_forum_thread t
LEFT JOIN tl_member m ON m.id = t.author
WHERE m.id IS NULL;

-- Posts without a thread
SELECT COUNT(*) AS orphan_posts
FROM tl_c4g_forum_post p
LEFT JOIN tl_c4g_forum_thread t ON t.id = p.pid
WHERE t.id IS NULL;

-- Posts with a missing author
SELECT COUNT(*) AS posts_missing_author
FROM tl_c4g_forum_post p
LEFT JOIN tl_member m ON m.id = p.author
WHERE m.id IS NULL;

-- Threads whose last_post_id does not exist
SELECT COUNT(*) AS threads_bad_last_post
FROM tl_c4g_forum_thread t
LEFT JOIN tl_c4g_forum_post p ON p.id = t.last_post_id
WHERE t.last_post_id > 0 AND p.id IS NULL;

-- PN sender/recipient orphans
SELECT
  SUM(CASE WHEN sm.id IS NULL THEN 1 ELSE 0 END) AS pn_missing_sender,
  SUM(CASE WHEN rm.id IS NULL THEN 1 ELSE 0 END) AS pn_missing_recipient
FROM tl_c4g_forum_pn pn
LEFT JOIN tl_member sm ON sm.id = pn.sender_id
LEFT JOIN tl_member rm ON rm.id = pn.recipient_id;

-- Thread subscription orphans
SELECT
  SUM(CASE WHEN m.id IS NULL THEN 1 ELSE 0 END) AS thread_sub_missing_member,
  SUM(CASE WHEN t.id IS NULL THEN 1 ELSE 0 END) AS thread_sub_missing_thread,
  SUM(CASE WHEN f.id IS NULL THEN 1 ELSE 0 END) AS thread_sub_missing_forum
FROM tl_c4g_forum_thread_subscription s
LEFT JOIN tl_member m ON m.id = s.member
LEFT JOIN tl_c4g_forum_thread t ON t.id = s.pid
LEFT JOIN tl_c4g_forum f ON f.id = t.pid;

-- Subforum subscription orphans
SELECT
  SUM(CASE WHEN m.id IS NULL THEN 1 ELSE 0 END) AS forum_sub_missing_member,
  SUM(CASE WHEN f.id IS NULL THEN 1 ELSE 0 END) AS forum_sub_missing_forum
FROM tl_c4g_forum_subforum_subscription s
LEFT JOIN tl_member m ON m.id = s.member
LEFT JOIN tl_c4g_forum f ON f.id = s.pid;

-- Upload records whose file row is missing
SELECT COUNT(*) AS uploads_missing_file
FROM tl_c4g_forum_upload u
LEFT JOIN tl_files f ON f.uuid = u.fileUuid
WHERE f.id IS NULL;

-- Reactions whose post or member is missing
SELECT
  SUM(CASE WHEN p.id IS NULL THEN 1 ELSE 0 END) AS reactions_missing_post,
  SUM(CASE WHEN m.id IS NULL THEN 1 ELSE 0 END) AS reactions_missing_member
FROM tl_c4g_forum_post_reaction r
LEFT JOIN tl_c4g_forum_post p ON p.id = r.pid
LEFT JOIN tl_member m ON m.id = r.member;
```

- [ ] Record counts and whether each category is zero or non-zero.
- [ ] Compare thread-subscription orphans with what `deleteUnreferencedSubscriptionsCron` would remove; do not run the cron on the restored copy without approval.

## 4. Subscriptions and Thread State

```sql
SELECT COUNT(DISTINCT member) AS members_with_thread_subscriptions FROM tl_c4g_forum_thread_subscription;
SELECT COUNT(DISTINCT pid) AS subscribed_threads FROM tl_c4g_forum_thread_subscription;
SELECT COUNT(DISTINCT member) AS members_with_forum_subscriptions FROM tl_c4g_forum_subforum_subscription;
SELECT COUNT(DISTINCT pid) AS subscribed_forums FROM tl_c4g_forum_subforum_subscription;

SELECT COUNT(*) AS threads_with_first_post
FROM tl_c4g_forum_thread t
WHERE EXISTS (
  SELECT 1 FROM tl_c4g_forum_post p WHERE p.pid = t.id AND p.post_number = 1
);

SELECT COUNT(*) AS threads_without_first_post
FROM tl_c4g_forum_thread t
WHERE NOT EXISTS (
  SELECT 1 FROM tl_c4g_forum_post p WHERE p.pid = t.id AND p.post_number = 1
);
```

- [ ] A non-zero `threads_without_first_post` blocks assuming every thread has a `post_number = 1` row; the fork's first-post behavior must tolerate it.

## 5. Notification Center Inventory

```sql
SELECT type, COUNT(*) AS notification_count
FROM tl_nc_notification
WHERE type IN (
  'sub_new_thread','sub_deleted_thread','sub_moved_thread',
  'sub_new_post','sub_deleted_post','sub_edited_post','mail_new_pm'
)
GROUP BY type;

SELECT COUNT(*) AS messages FROM tl_nc_message;
SELECT COUNT(*) AS languages FROM tl_nc_language;
SELECT COUNT(*) AS gateways FROM tl_nc_gateway;
SELECT COUNT(*) AS registrations FROM tl_nc_registration;

SELECT
  id,
  type,
  sub_new_thread <> '' AS has_sub_new_thread,
  sub_deleted_thread <> '' AS has_sub_deleted_thread,
  sub_moved_thread <> '' AS has_sub_moved_thread,
  sub_new_post <> '' AS has_sub_new_post,
  sub_deleted_post <> '' AS has_sub_deleted_post,
  sub_edited_post <> '' AS has_sub_edited_post,
  mail_new_pm <> '' AS has_mail_new_pm,
  new_pm_redirect > 0 AS has_new_pm_redirect
FROM tl_module
WHERE type LIKE 'c4g_forum%';
```

- [ ] Record whether each forum module has configured notification IDs.
- [ ] Record whether an e-mail gateway exists and is active (count only; no credentials).
- [ ] Record whether `de` language rows exist for the configured notifications.
- [ ] Record the number of module settings whose notification ID does not resolve. The following read-only PHP snippet may be run in a throwaway container; redirect output to a private operator record, not Git:
  - Deserialize each non-empty `sub_*`/`mail_new_pm` field with Contao `StringUtil::deserialize`.
  - For each ID, check `tl_nc_notification` existence.
  - Print only module ID, field name, configured ID count, and missing ID count.
- [ ] Treat zero configured notifications as “notification setup missing”, not as “no notifications required”, until the product owner confirms.

## 6. Data-Dependent Constants

Run these checks against the anonymized copy. They return IDs and flags only, not titles or names.

```sql
SELECT id, pid, published
FROM tl_c4g_forum
WHERE id IN (1,5,6,7,8,9,10,11,12,13,14,15,16,17,18)
ORDER BY id;

SELECT id, pid, published
FROM tl_c4g_forum_thread
WHERE id IN (86,87);

SELECT id, disable
FROM tl_member
WHERE id = 818;

SELECT COUNT(*) AS members_with_group_6_candidate
FROM tl_member
WHERE groups LIKE '%"6"%' OR groups LIKE '%i:6;%';

SELECT
  SUM(subject = 'Willkommensnachricht') AS welcome_messages,
  SUM(subject = 'Neues Mitglied') AS new_member_messages
FROM tl_c4g_forum_pn;
```

- [ ] Confirm all category IDs referenced by navigation exist and are published.
- [ ] Confirm threads `86` and `87` exist and belong to the expected forum IDs.
- [ ] Confirm member `818` exists, is not disabled, and is acceptable as the sender.
- [ ] Confirm group `6` exists and its membership count is plausible. `tl_member.groups` is a serialized field, so the `LIKE` query is an approximation; use Contao's deserializer when an exact count is required.
- [ ] Confirm the two fixed PN subjects are present only if the welcome-message behavior is still required.

## 7. Attachment and Avatar Locations

```sql
SELECT COUNT(*) AS total_uploads FROM tl_c4g_forum_upload;

SELECT COUNT(*) AS files_under_uploads
FROM tl_files WHERE path LIKE 'files/uploads/%';

SELECT COUNT(*) AS files_under_userimages
FROM tl_files WHERE path LIKE 'files/userimages/%';

SELECT COUNT(*) AS files_under_forum
FROM tl_files WHERE path LIKE 'files/forum/%';

SELECT SUBSTRING_INDEX(path, '/', 3) AS directory_prefix, COUNT(*) AS file_count
FROM tl_files
WHERE path LIKE 'files/uploads/%' OR path LIKE 'files/userimages/%'
GROUP BY directory_prefix;

SELECT m.id AS module_id, f.path AS upload_folder
FROM tl_module m
LEFT JOIN tl_files f
  ON f.uuid = m.c4g_forum_bbcodes_editor_imguploadpath
  OR f.uuid = m.c4g_forum_bbcodes_editor_fileuploadpath
WHERE m.type LIKE 'c4g_forum%';
```

Filesystem checks (counts and sizes only; never list filenames in the record):

```bash
find files/uploads -type f 2>/dev/null | wc -l
find files/userimages -type f 2>/dev/null | wc -l
find files/forum -type f 2>/dev/null | wc -l
du -sh files/uploads files/userimages files/forum 2>/dev/null
```

- [ ] Record whether `tl_c4g_forum_upload` rows resolve to `tl_files` rows.
- [ ] Record whether the module-configured upload folders exist inside the mounted `files/` tree.
- [ ] Record filesystem counts and compare them with `tl_files` counts; a mismatch indicates legacy uploads that are not registered in Contao.
- [ ] Check the legacy Core uploader path `/files/uploads/images/` separately if `imgUpload.php` was used; do not assume `tl_files` covers those files.
- [ ] Confirm avatar files under `files/userimages/user_<id>` correspond to `tl_member.memberImage`; record mismatch counts only.

## 8. Result Recording Template

Record only this shape in the follow-up issue or a private operational document:

| Check | Result | Interpretation | Owner |
| --- | --- | --- | --- |
| Expected tables present | e.g. 20/22 | Missing tables block port | Operator |
| Thread/post/PN counts | aggregate counts | Size and migration effort | Operator |
| Orphan counts | aggregate counts | Cleanup required before/after port | Operator |
| Subscriptions | distinct members/threads | Subscription behavior in scope | Product owner |
| NC rows and wiring | counts/booleans | Missing setup or migration needed | Operator + product owner |
| Category 1/5–18 | present/missing | Navigation risk | Product owner |
| Threads 86/87 | present/missing | Welcome-link risk | Product owner |
| Member 818 | present/disabled | Welcome-message risk | Operator |
| Upload/avatar counts | aggregates | Attachment migration scope | Operator |

Do not attach the database, exports, screenshots containing personal data, or file listings to the repository.
