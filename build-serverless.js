import { build } from 'esbuild';

await build({
  entryPoints: ['api/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: 'api/index.js',
  external: [
    // Only externalize actual npm packages
    'express',
    '@neondatabase/serverless',
    'ws',
    'dotenv',
    'zod',
    'drizzle-orm',
    'crypto',
    'http',
    'path',
    'fs',
    'url'
  ],
  banner: {
    js: `import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);`
  }
}).catch(() => process.exit(1));

console.log('✓ Serverless function bundled successfully');
