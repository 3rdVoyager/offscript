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
