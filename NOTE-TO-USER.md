# Note to user

This directory was scaffolded **inside** the `n8n-agent-kit` plugin repo under `_work/` (which is gitignored) but its contents belong to a **separate** GitHub repo: `fazer-ai/n8n-workflows`.

## Move it out

The plugin's `fetch_pack.py` expects the catalog index at:

```
https://raw.githubusercontent.com/fazer-ai/n8n-workflows/main/index.json
```

So this scaffold needs to live in its own repo before the plugin can consume it.

### Steps

1. Create the repo empty on GitHub: <https://github.com/fazer-ai/n8n-workflows>.
2. From this directory (`_work/n8n-workflows/`), run:
   ```bash
   cd _work/n8n-workflows
   git init
   git branch -M main
   git remote add origin git@github.com:fazer-ai/n8n-workflows.git
   git add .
   git commit -m "initial scaffold"
   git push -u origin main
   ```
3. On the first push, the GitHub Actions workflow `update-index.yml` will run and regenerate `index.json`. Since no pack has a tag yet, `latest_version` will stay `null` for `corretora-seguros` until you ship the first release.
4. The real workflow JSONs are already in `packs/corretora-seguros/workflows/`. When ready, tag the release:
   ```bash
   git tag corretora-seguros-v0.1.0
   git push origin corretora-seguros-v0.1.0
   ```
   CI will pick up the tag and set `latest_version` in `index.json`.

## After moving

You can delete `_work/` from the plugin repo at your convenience. It is already in the plugin's `.gitignore` so it won't be committed accidentally.
