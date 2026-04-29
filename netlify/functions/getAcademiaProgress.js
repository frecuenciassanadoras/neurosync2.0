const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
  
  try {
      const { email } = JSON.parse(event.body);

      const SUPABASE_URL = "https://dothtuwrsplezhaxkjmw.supabase.co"; 
      const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvdGh0dXdyc3BsZXpoYXhram13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NzIzMjEsImV4cCI6MjA3MTI0ODMyMX0.B13yokCG9VQ49kjZ5pHeBdqBtW7i2CP8yg2l2Ekhqnc";
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

      const { data, error } = await supabase
        .from('neurosync_stats')
        .select('academia_level')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
      }

      // Si no existe el usuario o no tiene nivel, asumimos nivel 1
      return { 
          statusCode: 200, 
          body: JSON.stringify({ level: data && data.academia_level ? data.academia_level : 1 }) 
      };
  } catch(e) {
      return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
