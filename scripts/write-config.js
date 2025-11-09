const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const vars = {
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
};

if (!vars.SUPABASE_URL || !vars.SUPABASE_ANON_KEY) {
  console.error('Missing required env vars. Make sure .env contains API_URL and PUBLIC_KEY');
  process.exit(1);
}

const content = `// Auto-generated from .env (do not commit)
export const CONFIG = ${JSON.stringify(vars, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, '..', 'src', 'config', 'config.generated.ts'), content, 'utf8');
console.log('Wrote src/config.generated.ts');
