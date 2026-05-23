# Knowledge Base

Drop your Ambo University source documents into this directory. The ingestion
script walks the tree recursively and dispatches to the right parser by extension:

| Extension       | Parser              |
| --------------- | ------------------- |
| `.pdf`          | `pdf-parse`         |
| `.md`, `.mdx`   | passed through      |
| `.html`, `.htm` | `cheerio` (text only) |
| `.txt`          | passed through      |
| `.json`         | FAQ topics or campus `map` bundles (auto-detected); other JSON flattened to text |

The repo expects two optional structured files (copy them here before ingest):

- **`knowledge.json`** — array of `{ topic, questions[], answer, synonyms?[] }` (FAQ style).
- **`locations.json`** — array of `{ "Campus name": { name[], gate_closing_time, dorm_types[], utilities[], map: { label: googleMapsUrl } } }`.

Structured JSON-derived docs get a credit line (**Developer's Club**, leader **Natnael Eskinder**) appended during ingest.

Run `npm run ingest` from the repo root. The script is idempotent — re-running
will skip documents whose content hash hasn't changed.

This folder is `.gitignore`d; commit your data only if it's safe to share.
