const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const vars = {
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
};

if (!vars.SUPABASE_URL || !vars.SUPABASE_ANON_KEY) {
  console.error(' Missing required env vars. Make sure .env contains SUPABASE_URL and SUPABASE_ANON_KEY');
  process.exit(1);
}

const content = `// Auto-generated from .env
// Do not edit manually. Run "npm run config" to regenerate.

export const SUPABASE_URL = "${vars.SUPABASE_URL}";
export const SUPABASE_ANON_KEY = "${vars.SUPABASE_ANON_KEY}";
`;

const targetDir = path.join(__dirname, '..', 'src', 'core', 'platform');
const targetFile = path.join(targetDir, 'config.ts');

try {
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(targetFile, content, { encoding: 'utf8', flag: 'w' });

  console.log(`Config updated at ${targetFile}`);
} catch (err) {
  console.error('Failed to write config file:', err);
  process.exit(1);
}
