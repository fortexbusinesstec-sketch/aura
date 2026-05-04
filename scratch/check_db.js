const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  "https://inymmpaxmsimtlckvwof.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlueW1tcGF4bXNpbXRsY2t2d29mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3OTMyMjksImV4cCI6MjA5MjM2OTIyOX0.9m3jp38b8BmxOgHQAqRgcg38Ub4k4o-Qt4KKRgNTutE"
);

async function check() {
  console.log('--- Proyectos ---');
  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, name, status, created_at, client_id, opportunity_id');
  
  if (error) console.error(error);
  else console.log(JSON.stringify(projects, null, 2));

  console.log('--- Ultimo Lead ---');
  const { data: leads } = await supabase
    .from('opportunities')
    .select('id, status, updated_at')
    .order('updated_at', { ascending: false })
    .limit(1);
  console.log(JSON.stringify(leads, null, 2));
}

check();
