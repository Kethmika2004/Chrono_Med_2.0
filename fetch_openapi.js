import fs from 'fs';
import path from 'path';
import https from 'https';

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const getEnvVar = (name) => {
  const match = envContent.match(new RegExp(`${name}\\s*=\\s*(\\S+)`));
  return match ? match[1] : null;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const serviceRoleKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase URL or Service Role Key');
  process.exit(1);
}

const url = `${supabaseUrl}/rest/v1/?apikey=${serviceRoleKey}`;

console.log('Fetching schema description using service role key...');
https.get(url, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    try {
      const schema = JSON.parse(body);
      const output = {};
      
      if (schema.definitions) {
        for (const [tableName, tableDef] of Object.entries(schema.definitions)) {
          output[tableName] = {
            columns: Object.keys(tableDef.properties || {}),
            required: tableDef.required || [],
            properties: tableDef.properties
          };
        }
        
        fs.writeFileSync(
          path.resolve(process.cwd(), 'db_schema_details.json'),
          JSON.stringify(output, null, 2),
          'utf8'
        );
        console.log('Successfully wrote schema details to db_schema_details.json');
      } else {
        console.error('definitions not found in response', body.substring(0, 500));
      }
    } catch (e) {
      console.error('Failed to parse schema response:', e.message);
      console.log('Raw response preview:', body.substring(0, 500));
    }
  });
}).on('error', (err) => {
  console.error('HTTP Request failed:', err.message);
});
