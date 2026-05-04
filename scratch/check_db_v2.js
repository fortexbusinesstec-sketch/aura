const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();

// Clean key (remove prefix/suffix if present)
const cleanKey = key.replace(/^t/, '').replace(/ice-role$/, '');

const supabase = createClient(url, cleanKey);

async function check() {
  console.log('Using URL:', url);
  
  const { data: leads, error: lError } = await supabase.from('opportunities').select('*').limit(1);
  if (lError) console.error('Leads Error:', lError);
  else if (leads && leads.length > 0) console.log('Opportunities columns:', Object.keys(leads[0]).join(', '));
  else console.log('No opportunities found even with service role');

  const { data: projects, error: pError } = await supabase.from('projects').select('*').limit(1);
  if (pError) console.error('Projects Error:', pError);
  else if (projects && projects.length > 0) console.log('Projects columns:', Object.keys(projects[0]).join(', '));
  else console.log('No projects found even with service role');
}

check();
