const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
  
  try {
      const { email } = JSON.parse(event.body);

      const SUPABASE_URL = "https://dothtuwrsplezhaxkjmw.supabase.co"; 
      const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvdGh0dXdyc3BsZXpoYXhram13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NzIzMjEsImV4cCI6MjA3MTI0ODMyMX0.B13yokCG9VQ49kjZ5pHeBdqBtW7i2CP8yg2l2Ekhqnc";
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

      // Si piden el conteo total
      if (email === 'COUNT_ALL') {
        const { count, error } = await supabase
          .from('reunion_registros')
          .select('*', { count: 'exact', head: true })
          .eq('reunion_id', 'reunion_1');

        if (error) {
          return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
        }
        return { statusCode: 200, body: JSON.stringify({ count: count || 0 }) };
      }

      // Verificar si el usuario está registrado
      const { data: existing } = await supabase
        .from('reunion_registros')
        .select('id')
        .eq('email', email)
        .eq('reunion_id', 'reunion_1')
        .maybeSingle();

      return { 
        statusCode: 200, 
        body: JSON.stringify({ registered: !!existing }) 
      };
  } catch(e) {
      return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
