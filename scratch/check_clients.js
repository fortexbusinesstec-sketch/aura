const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();
const cleanKey = key.replace(/^t/, '').replace(/ice-role$/, '');
const supabase = createClient(url, cleanKey);

async function check() {
  const { data: clients } = await supabase.from('clients').select('*').limit(1);
  if (clients && clients.length > 0) console.log('Clients columns:', Object.keys(clients[0]).join(', '));
}

check();
