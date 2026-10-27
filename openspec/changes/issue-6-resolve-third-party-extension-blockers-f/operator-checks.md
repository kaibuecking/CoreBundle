# Operator Checks (Read-Only)

Run against a **restored/anonymized staging copy**, not production. Do not paste credentials, dumps,
personal data, file contents, or row payloads into Git, tickets, or chat. Record counts and yes/no
results only.

## 1. Composer Lock And Resolver

```bash
cd contao
composer validate --no-check-publish
composer show --locked | sort
composer prohibits contao/core-bundle 5.7.15 --locked --no-interaction
```

Record:

- The lockfile hash and the `contao/core-bundle` version.
- The full blocker list; classify each entry as extension, Contao bundle, or environment.
- Any deviation from the #6 evidence set.

## 2. Cron

```sql
SELECT COUNT(*) AS jobs FROM tl_cron_job;
SELECT job, COUNT(*) AS runs FROM tl_cron_log GROUP BY job ORDER BY job;
```

Filesystem:

```bash
ls -la contao/system/modules/cron/jobs/
crontab -l 2>/dev/null || true
```

Confirm which jobs actually execute and whether `bbcron/startjobs` and/or `contao:cron` is active.
Do not copy job payloads that contain member data.

## 3. Leads (Decision Gate)

```sql
SHOW TABLES LIKE 'tl_lead%';
SELECT COUNT(*) AS forms FROM tl_form;
SELECT COUNT(*) AS leads FROM tl_lead;
SELECT COUNT(*) AS lead_data FROM tl_lead_data;
SELECT COUNT(*) AS lead_export FROM tl_lead_export;
```

If any lead table contains rows, stop the removal path and choose export/archive or the `3.4.1`
fallback. Also check whether any form uses a lead capture setting:

```sql
SELECT id, title FROM tl_form WHERE lead_enable = 1;
```

If `lead_enable` does not exist in this schema, report that instead of guessing.

## 4. Notification Center

```sql
SELECT COUNT(*) AS notifications FROM tl_nc_notification;
SELECT COUNT(*) AS messages FROM tl_nc_message;
SELECT COUNT(*) AS languages FROM tl_nc_language;
SELECT COUNT(*) AS gateways FROM tl_nc_gateway;
SELECT COUNT(*) AS registrations FROM tl_nc_registration;
SELECT id, title, type FROM tl_nc_notification ORDER BY id;
```

Module references:

```sql
SELECT id, name, sub_new_thread, sub_deleted_thread, sub_moved_thread,
       sub_new_post, sub_deleted_post, sub_edited_post, mail_new_pm
FROM tl_module
WHERE sub_new_thread IS NOT NULL OR mail_new_pm IS NOT NULL;
```

Confirm which IDs are configured and whether every ID resolves to an existing notification. Do not
export message bodies or recipient lists.

## 5. RockSolid Content And Forms

```sql
SELECT type, COUNT(*) AS rows FROM tl_content
WHERE type LIKE '%rocksolid%' OR type LIKE '%rs%'
GROUP BY type ORDER BY type;
```

Adjust the type list to the actual RockSolid type names in the installation; a broad `LIKE` is only a
starting point. For form protection:

```sql
SELECT id, title FROM tl_form WHERE anti_spam = 1;
```

If the column name differs, report the actual schema rather than assuming.

## 6. Altcha

```bash
sed -n '/altcha/,+10p' contao/config/config.yaml
```

Record which keys exist and whether they match `algorithm`, `range_min`, `range_max`,
`challenge_expiry`. Do not copy unrelated secrets (SMTP/Novalnet/env values) from this file.

```sql
SELECT id, title FROM tl_form WHERE altcha = 1;
```

If the column does not exist, report it.

## 7. Fineuploader And Uploads

```sql
SELECT COUNT(*) AS members FROM tl_member;
SELECT COUNT(*) AS with_certificate FROM tl_member
WHERE xt_zertifikat IS NOT NULL AND xt_zertifikat <> '';
SELECT COUNT(*) AS with_avatar FROM tl_member
WHERE memberImage IS NOT NULL AND memberImage <> '';
SELECT COUNT(*) AS tl_files_rows FROM tl_files;
```

Filesystem (counts and sizes only, no contents):

```bash
find contao/files/zertifikate_hochbegabung -type f | wc -l
du -sh contao/files/zertifikate_hochbegabung 2>/dev/null || true
```

Check that recorded paths resolve to existing files in staging. Do not copy certificates or avatars.

## 8. Kartik Asset

```bash
test -d contao/files/kartik-v/bootstrap-fileinput && echo "asset present"
find contao/files/kartik-v/bootstrap-fileinput -maxdepth 2 -type f | head -20
```

Confirm templates reference `files/kartik-v/...` and not a `vendor/kartik-v/...` path.

## 9. Frontend Assets

```bash
test -f contao/assets/font-awesome/css/font-awesome.min.css && echo "fa present"
test -f contao/assets/jquery/jquery.min.js && echo "jquery present"
test -f contao/assets/jquery-ui/jquery-ui.min.js && echo "jqueryui present"
```

Confirm the `fe_page.html5` and template paths match these files.

## 10. Payment, Mail, PDF Data

Read-only counts only:

```sql
SELECT COUNT(*) AS orders FROM tl_order;
SELECT COUNT(*) AS webhook_events FROM tl_novalnet_webhook_event;
```

Do not export customer, payment, or invoice data. Verify that secrets come from environment variables
and are not committed.

## 11. Evidence Gap

Upstream release notes and changelogs could not be fetched in #6 because GitHub access is prohibited.
Before #8 applies any target version, a maintainer with authorized access must review the release notes
for behavioural changes, schema changes, and breaking API changes, and record the result in the #8
change. Composer constraint metadata alone is not sufficient for that final decision.

## 12. Reporting Format

For each check, report:

- Environment (staging copy identifier, date).
- Command or query used.
- Count/yes/no result.
- Whether it confirms or contradicts the #6 decision.
- No raw personal data, secrets, dumps, or file contents.
