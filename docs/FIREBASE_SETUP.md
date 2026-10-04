# Firebase setup for TKVault

TKVault uses Firebase Authentication and Cloud Firestore for shared member and collection data. The Firebase web configuration in `src/firebase.js` is public client configuration, not a service-account credential. Firestore rules enforce group access; never replace them with public read/write rules.

## One-time Firebase setup

1. In Firebase Console for project `tkvault-c6263`, enable **Authentication → Sign-in method → Email/Password**.
2. Create the Firestore database in **Native mode**.
3. Create the administrator Auth user `tkdvofinance@gmail.com` from **Authentication → Users** and set its password there. Do not add the administrator through the public signup page.
4. Publish the rules in [`../firestore.rules`](../firestore.rules) under **Firestore Database → Rules**.
5. Under **Authentication → Settings → Authorized domains**, add `cshoon07.github.io` (and any custom app domain).
6. Sign in as the administrator. Group signups appear in **Admin Profile → Group account requests**; approve each intended treasurer before they can read or change that group&apos;s data.

Alternatively, after installing and authenticating the Firebase CLI, publish the checked-in rules with `firebase deploy --only firestore:rules`.

## Free hosting

For the first deployment, open **Repository Settings → Pages → Build and deployment** and set **Source** to **GitHub Actions**. The workflow cannot enable this repository setting itself with GitHub's restricted default workflow token. Afterward, the GitHub Pages workflow builds and deploys the web app when changes reach `main`.

GitHub Pages is free for a public repository, and Firestore/Auth can remain on Firebase's no-cost Spark plan while within its quotas. The Firebase project can require a billing account if free quotas are exceeded; monitor usage in Firebase Console.

## Shared and device-local data

- Members, collections, weekly-dues usage, collection goal, Google Sheets link, and event choices sync through Firestore. Saturday dues and their once-per-date marker are committed together so a failed update cannot leave dues unrecorded or apply them twice.
- Uploaded liquidation files and receipts remain in the browser/device that uploaded them. Use the shared Google Sheets URL for a team-editable liquidation report; Firestore documents have a 1 MiB size limit and are not file storage.
- Existing browser-local members and collections are copied to Firestore the first time an authenticated admin or group account opens that group. Keep a separate backup before enabling the cloud sync.
