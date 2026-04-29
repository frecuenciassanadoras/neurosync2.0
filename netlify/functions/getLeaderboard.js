const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  const SUPABASE_URL = "https://dothtuwrsplezhaxkjmw.supabase.co"; 
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvdGh0dXdyc3BsZXpoYXhram13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NzIzMjEsImV4cCI6MjA3MTI0ODMyMX0.B13yokCG9VQ49kjZ5pHeBdqBtW7i2CP8yg2l2Ekhqnc";
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Obtener todos los usuarios que no están en ghost_mode, ordenados por minutos
  const { data, error } = await supabase
    .from('neurosync_stats')
    .select('name, total_minutes, ghost_mode, email')
    .eq('ghost_mode', false)
    .order('total_minutes', { ascending: false })
    .limit(50);

  if (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }

  return { 
      statusCode: 200, 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data) 
  };
};
