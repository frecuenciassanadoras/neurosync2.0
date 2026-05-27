const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
  
  try {
      const { email, nombre } = JSON.parse(event.body);

      const SUPABASE_URL = "https://dothtuwrsplezhaxkjmw.supabase.co"; 
      const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvdGh0dXdyc3BsZXpoYXhram13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NzIzMjEsImV4cCI6MjA3MTI0ODMyMX0.B13yokCG9VQ49kjZ5pHeBdqBtW7i2CP8yg2l2Ekhqnc";
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

      // Verificar si ya está registrado
      const { data: existing } = await supabase
        .from('reunion_registros')
        .select('id')
        .eq('email', email)
        .eq('reunion_id', 'reunion_1')
        .maybeSingle();

      if (existing) {
        return { statusCode: 200, body: JSON.stringify({ success: true, already: true }) };
      }

      // Insertar nuevo registro
      const { error } = await supabase
        .from('reunion_registros')
        .insert({ 
            email: email,
            nombre: nombre || email.split('@')[0],
            reunion_id: 'reunion_1',
            registrado_en: new Date().toISOString(),
            asistio: false
        });

      if (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
      }

      return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch(e) {
      return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
