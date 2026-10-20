# OffScript

OffScript is a browser-based script practice app. It helps performers import a
script, choose what to practice, and rehearse lines from memory.

The app uses Astro components for page structure and small client-side TypeScript modules
for interactive features. Script data is currently stored in the browser's
local storage.

## Getting started

Requirements:

- Node.js 22.12 or newer
- npm

```sh
npm install
npm run dev
```

Open the local URL printed by Astro, usually `http://localhost:4321`.

## Project structure

```text
src/
├── components/       Reusable Astro UI components
├── layouts/          Site and app shells
├── pages/            Routes and page-specific client scripts
├── scripts/          Shared browser-side TypeScript
└── styles/           Shared and page-specific CSS
functions/
├── api/               Cloudflare Pages Function routes
└── lib/               Server-side parsing helpers and contracts
public/
├── assets/           Brand assets and icons
└── example-scripts/  Importable example script files
```

## Commands

Run these commands from the project root:

| Command             | Description                            |
| ------------------- | -------------------------------------- |
| `npm install`       | Install dependencies                   |
| `npm run dev`       | Start the local development server     |
| `npm run build`     | Build the production site into `dist/` |
| `npm run preview`   | Preview the production build locally   |
| `npm run astro ...` | Run an Astro CLI command               |
| `npm run screenshots` | Regenerate marketing images (main panel only) |
| `npm run pages:dev` | Run the built site with Pages Functions locally |
| `npm run types`     | Generate Cloudflare binding types             |
| `npm test`          | Run parser tests                              |

## AI script parsing

The Add script page accepts OffScript JSON locally and can use the Workers AI
parser for plain-text or Markdown scripts. The parser converts the document to
OffScript schema version 1 and returns it to the browser; scripts are still
saved in local storage.

Workers AI is a paid remote binding, including during local development. To
test the Pages Function:

```sh
npm run build
npm run pages:dev
```

The `AI` binding must be configured on the Cloudflare Pages project under
Settings > Functions > Bindings, or supplied to Wrangler with `--ai AI` as in
the command above. Deploy with:

```sh
npx wrangler pages deploy ./dist
```

The endpoint accepts `POST /api/parse-script` with a JSON body containing a
`text` string. Anonymous parsing is intentionally limited to 50,000 source
characters per request. Do not include secrets or private information in
documents sent for parsing.

## Commits and releases

Uses [Conventional Commits](https://www.conventionalcommits.org/) for changes:

```text
feat: add scene practice settings
fix: preserve the selected script
chore: update dependencies
```

The Release Please workflow on `main` uses these commit messages to prepare
release pull requests and generate version tags. Breaking changes should use
`!` or include a `BREAKING CHANGE:` footer.

## Astro documentation

For Astro-specific questions, see the
[Astro documentation](https://docs.astro.build/).
