# Branding assets (local)

Put your logo, favicon, and other static brand files here.

## Local usage (no ImageKit)
Anything in `client/public` is served as-is by Vite.

Examples:
- `client/public/branding/logo.png` → use as `/branding/logo.png`
- `client/public/branding/logo.svg` → use as `/branding/logo.svg`

## Upload to ImageKit later
When you’re ready, use the uploader script:

```bash
node services/upload-service/scripts/uploadBrandingAssets.js
```

It uploads everything in this folder to ImageKit under:

- `explore-fusion/branding/<filename>`

Requirements:
- ImageKit env vars available (same ones you already use for uploads):
  - `IMAGEKIT_PUBLIC_KEY`
  - `IMAGEKIT_PRIVATE_KEY`
  - `IMAGEKIT_URL_ENDPOINT`

Notes:
- Files like `README.md` and `.gitkeep` are ignored.
