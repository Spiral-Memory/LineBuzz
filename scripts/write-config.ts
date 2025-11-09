const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const vars = {
  API_URL: process.env.API_URL || '',
  PUBLIC_KEY: process.env.PUBLIC_KEY || '',
};

if (!vars.API_URL || !vars.PUBLIC_KEY) {
  console.error('Missing required env vars. Make sure .env contains API_URL and PUBLIC_KEY');
  process.exit(1);
}

const content = `// Auto-generated from .env (do not commit)
export const CONFIG = ${JSON.stringify(vars, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, '..', 'src', 'config.generated.ts'), content, 'utf8');
console.log('Wrote src/config.generated.ts');
