// Load backend/.env regardless of process.cwd() (npm workspaces run scripts from repo root).
import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const backendRoot = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(backendRoot, '.env') });
