import fs from 'fs';
import path from 'path';

const schemaPath = path.resolve(process.cwd(), 'db_schema_details.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

console.log('=== DATABASE SCHEMAS ===');
for (const [tableName, details] of Object.entries(schema)) {
  console.log(`\nTable: ${tableName}`);
  console.log(`Columns:`, details.columns.join(', '));
  console.log(`Required:`, details.required.join(', '));
}
