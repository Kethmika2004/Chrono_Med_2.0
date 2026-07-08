import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const getEnvVar = (name) => {
  const match = envContent.match(new RegExp(`${name}\\s*=\\s*(\\S+)`));
  return match ? match[1] : null;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testJoin() {
  console.log('Testing appointments -> sessions -> doctors -> user_profiles join...');
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id,
      token_number,
      status,
      sessions (
        id,
        session_date,
        start_time,
        end_time,
        status,
        delay_minutes,
        doctors (
          id,
          specialty,
          user_profiles:profile_id (
            full_name,
            avatar_url
          )
        ),
        hospitals (
          id,
          name,
          city
        )
      )
    `)
    .limit(1);

  if (error) {
    console.error('Join Error:', error.message);
  } else {
    console.log('Join Succeeded! Return data:', JSON.stringify(data, null, 2));
  }
}

testJoin();
