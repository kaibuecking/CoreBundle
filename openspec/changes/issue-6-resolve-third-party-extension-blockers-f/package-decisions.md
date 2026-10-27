# Package Decisions

One explicit disposition per package. `Bridge` means an approved Contao 4.13 upgrade in this issue; `#8` means the version belongs to the final platform change. Decisions D1–D10 are the approved Forum/Core decisions from the #1 inventory.

| ID | Package | Decision | Target | Timing | Rationale |
| --- | --- | --- | --- | --- | --- |
| E1 | `bugbuster/contao-cron-bundle` | Keep and upgrade | `^1.7.3` | #8 | Seven custom jobs depend on the scheduler; `1.7.3` is the first line supporting Contao `5.6–5.7`. No 4.13 bridge exists (`1.6.x` requires `^5.2`). Jobs must migrate off legacy `system/initialize.php`/`Backend`/`$cronJob`. |
| E2 | `netzmacht/contao-font-awesome-inserttag` | Keep and upgrade | `^2.2.3` | #8 | The inserttag is used across navigation, login, glossary, member, and forum templates. `2.2.1` is a safe 4.13 bridge; `2.2.3` requires Contao `^5.3` and PHP `^8.2`. |
| E3 | `terminal42/contao-leads` | Remove (data-gated) | Remove; fallback `^3.4.1` | Bridge none; #8 | No application code/template/DCA/config reference exists. Direct Composer requirement only. Remove after a read-only `tl_lead*` check; export/archive any data first. If active use is confirmed, the fallback is `3.4.1` at #8 (requires Contao `^5.7`). |
| E4 | `terminal42/notification_center` | Keep and migrate | `^2` (`2.7.8`) | #8 | Required by Projects 5 and the Forum notification types. NC 1 → 2 is a schema/API migration, not a bump. It cannot be bridged on 4.13 because Projects 4 and the deployed Forum fork require NC 1. |
| E5 | `terminal42/contao-fineuploader` | Keep and upgrade | `^3.5.5` | Bridge `3.5.5`; #8 | Certificate and avatar uploads are active. `3.5.5` supports both `^4.13` and `^5.0`; the patch reduces drift without a schema change. D6 removes only the Core fork's legacy vendor uploader (`imgUpload.php`, `DialogHandler.js`); it does not replace or remove Fineuploader, which remains evaluated on its own merits. |
| E6 | `madeyourday/contao-rocksolid-antispam` | Keep and upgrade | `^2.1.3` | Bridge `v2.1.3`; #8 | `v2.1.3` supports `^4.13 || ^5.0 || ^6.0`. Retain because form protection is data/config-driven and cannot be proven unused by code search. |
| E7 | `madeyourday/contao-rocksolid-columns` | Keep and upgrade | `^2.1.3` | #8 | `v2.1.2` already supports `^5.0`; `v2.1.3` requires Contao `^5.3`, so it cannot be a 4.13 bridge. Content rows must be retained. |
| E8 | `madeyourday/contao-rocksolid-slider` | Keep and upgrade | `^2.2.11` | Bridge `v2.2.10`; #8 | `v2.2.10` supports `^4.13 || ^5.0`; `v2.2.11` requires `^5.3`. Slider content rows must be retained. |
| E9 | `markocupic/contao-altcha-antispam` | Keep and upgrade | `^0.8.0` | Bridge `0.7.3` (conditional); #8 | ALTCHA is configured in `config/config.yaml`. `0.7.3` supports `^4.13 || ^5.0`; `0.8.0` requires `^5.3`. Verify config keys and challenge markup before the minor bridge. |
| E10 | `kaibuecking/core` | Remove | Upstream `con4gis/core ^8` | #8 | D1 drops the Core fork. No namespace rename and only two application hunks plus a two-line guard; a second Core identity is not justified. Remove the Dockerfile deletion workaround. |
| E11 | `kaibuecking/forum` | Replace | Narrow fork on `con4gis/forum` `v5.0.6` | #8 | D1/D3 keep only proven fork behavior (first-post pinning, PN service integration, notification suppression) on upstream 5.x. Presentation moves to the application. |
| E12 | `con4gis/core` | Upgrade | `^8` | #8 | Required by Forum `v5.0.6`, Groups `v2.10`, and Projects `v5.0.43`. Today it is `v7.1.7` and is deleted from vendor at runtime. |
| E13 | `con4gis/projects` | Upgrade | `^5` (`v5.0.43`) | #8 | Projects 5 supports `^4.13 || ^5.3`, requires core `^8` and NC `^2`; it is the bridge between Forum and NC 2. |
| E14 | `con4gis/groups` | Upgrade | `^2.10` (`v2.10.2`) | #8 | Groups 2.10 requires Contao `^5.3`, core `^8`, projects `^5`; D10 keeps the existing group model. |
| E15 | `components/font-awesome` | Keep | `4.7.0` | #8 | Application-owned CSS/font asset loaded from `/assets/font-awesome`; no Contao coupling. |
| E16 | `components/jquery` | Keep | `3.6.0` | #8 | Application-owned script loaded from `/assets/jquery`; no Contao coupling. |
| E17 | `components/jqueryui` | Keep | `1.12.1` | #8 | Application-owned script/theme loaded from `/assets/jquery-ui`; verify no duplicate Contao 5 assets. |
| E18 | `kartik-v/bootstrap-fileinput` | Remove Composer requirement; keep app asset | Checked-in `files/kartik-v/bootstrap-fileinput` | Bridge now / #8 | Templates load the committed asset, not the Composer `dev-master` package. Removing the unpinned requirement removes drift without losing functionality. |
| E19 | `phpmailer/phpmailer` | Keep | `^6.12` | #8 | Used directly for SMTP mail; no Contao coupling. Move hardcoded SMTP credentials out of source separately. |
| E20 | `tecnickcom/tcpdf` | Keep | `^6.11` | #8 | Used for invoices and vouchers; no Contao coupling. |
| E21 | Novalnet client (application-owned) | Keep | Application code | #8 | No Composer package; uses `curl`. Validate the sandbox payment/webhook/subscription paths on PHP 8.5/Contao 5. |
| E22 | PayPal legacy payment type | Keep | Data enum | #8 | No SDK/package; only `PaymentType::PAYPAL` status logic remains. |
| E23 | `contao-community-alliance/composer-plugin` | Remove | Removed with NC 1/Leads 1 | #8 | NC 2 uses `composer-plugin-api`; Leads 3 no longer requires the CCA plugin. |
| E24 | `codefog/contao-haste` | Let target packages resolve | `^5.2` via NC 2 | #8 | Transitive; NC 2 requires `^5.2`, which supports Contao 4.13/5.x. |
| E25 | `menatwork/contao-multicolumnwizard(-bundle)` | Let target packages resolve | Projects 5 requirement `^3.6` | #8 | Transitive through Leads 1 and Projects 5; verify the bundle target at #8. |
| E26 | `oomphinc/composer-installers-extender` | Keep | `2.0.0` | #8 | Still needed for the `components/*` asset packages. |
| E27 | `curl/curl` | Keep | `2.5.0` | #8 | PHP cURL library used by application code and the Novalnet client. Requires `ext-curl`; no Contao coupling and no blocker. Keep `ext-curl` in the image. |
| E28 | `contao/conflicts` | Keep / skeleton equivalent | `dev-main` | #8 | Metapackage only; confirm the Contao 5 managed-edition skeleton still requires it. Not an extension blocker. |

## Decision Notes

- **Leads is the only removal.** Its capability has no code reference; removal is gated on a read-only data check. The fallback upgrade exists so a real form-history requirement does not block #8.
- **No NC bridge.** Although NC `2.6.2` advertises Contao `4.13.50`, Projects `v4.0.41` requires NC `^1.6` and the deployed Forum fork uses the same line. Bridging NC would force Projects/Forum work into the wrong change.
- **Cron is kept, not replaced.** The bundle provides the scheduler surface and job logging; the custom jobs are the migration work, not the package.
- **Frontend assets stay application-owned.** Moving them to Contao 5 components would change template URLs and asset build behavior without reducing extension risk.
- **No package is removed solely because it is old.** Each removal has either a replacement (Core fork), an app-owned asset (Kartik), or a data-gated retirement (Leads).
