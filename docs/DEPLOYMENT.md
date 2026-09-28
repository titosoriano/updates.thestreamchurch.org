# Deployment

`updates.thestreamchurch.org` is a fully static Astro site deployed from GitHub to the existing InterServer shared-hosting account over SSH. Cloudflare remains in front of the origin.

## Production flow

1. Contributor opens a pull request.
2. CI runs tests, the deployment failure-safety test, and the Astro build.
3. A reviewed change is merged to `main`.
4. `deploy.yml` rebuilds the site.
5. `scripts/deploy.sh` uploads `dist/` to a new release directory first.
6. Only after the upload and `index.html` verification succeed does the remote activation begin.
7. The current live directory is snapshotted as `previous` before activation. If the activation rsync fails, the script restores that snapshot automatically.

This deliberately avoids deleting `public_html` before a successful upload.

## GitHub Actions secrets

Configure these repository secrets. Reuse the existing InterServer SSH values already proven by the Estudios site where applicable.

- `INTERSERVER_HOST`
- `INTERSERVER_SSH_PORT`
- `INTERSERVER_USERNAME`
- `INTERSERVER_SSH_KEY`
- `INTERSERVER_SSH_HOST_KEY`
- `INTERSERVER_DEPLOY_PATH`
- `INTERSERVER_RELEASES_PATH`

Recommended Updates paths:

- deploy path: `/home/<cpanel-user>/domains/updates.thestreamchurch.org/public_html`
- releases path: `/home/<cpanel-user>/domains/updates.thestreamchurch.org/releases`

Do not store the private key, host-key lines, passwords, or Cloudflare credentials in the repository.

### SSH host verification

Follow the same fail-closed host-key pinning used by `estudios.thestreamchurch.org`. Do not run `ssh-keyscan` against the Cloudflare-proxied public subdomain during deployment. The known-host lines should be generated from the origin in a trusted context and saved in `INTERSERVER_SSH_HOST_KEY`.

## First hosting setup

Create `updates.thestreamchurch.org` in cPanel with its own document root. Create the releases directory outside `public_html` when possible. Confirm the SSH account can create files in both locations.

Before enabling production deployment, run the deploy script once against temporary non-production paths to confirm remote `rsync` is available and rollback works as expected.

## Cloudflare

The `updates` DNS record should be proxied through Cloudflare after the origin is ready and HTTPS is valid.

Start conservatively:

- HTML: short/no edge cache while publishing workflow is new.
- `/_astro/*`: long-lived cache, ideally one year with `immutable`, because Astro fingerprints these filenames.
- Event images: cacheable, but use a new filename when image bytes change if a long TTL has already been served.

Do not use Cloudflare Pages or Workers for version 1 of this site.

## Rollback

The deployment script keeps the previous live snapshot at the configured releases path as `previous`. If a successful deploy later needs to be rolled back manually, copy that snapshot back into the live document root with remote `rsync -a --delete` after confirming the target paths.

## Lockfile note

The initial project was authored in an environment that could not reach the npm registry, so the lockfile must be generated on an internet-connected development machine before the repository is considered production-ready:

```bash
npm install
npm test
npm run build
```

Commit the generated `package-lock.json`, then change both workflows from `npm install --no-audit --no-fund` to `npm ci` and optionally enable the npm cache in `actions/setup-node`.
