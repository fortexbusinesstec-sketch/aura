const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  "https://inymmpaxmsimtlckvwof.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlueW1tcGF4bXNpbXRsY2t2d29mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3OTMyMjksImV4cCI6MjA5MjM2OTIyOX0.9m3jp38b8BmxOgHQAqRgcg38Ub4k4o-Qt4KKRgNTutE"
);

async function check() {
  const { data, error } = await supabase.from('opportunities').select('*').limit(1);
  if (error) {
    console.error('Error:', error);
  } else if (data && data.length > 0) {
    console.log('Opportunities columns:', Object.keys(data[0]).join(', '));
  } else {
    console.log('No opportunities found');
  }
  
  const { data: pData, error: pError } = await supabase.from('projects').select('*').limit(1);
  if (pError) {
    console.error('Projects Error:', pError);
  } else if (pData && pData.length > 0) {
    console.log('Projects columns:', Object.keys(pData[0]).join(', '));
  } else {
    console.log('No projects found');
  }
}

check();
