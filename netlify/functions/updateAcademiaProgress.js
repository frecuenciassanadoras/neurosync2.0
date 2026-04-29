const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
  
  try {
      const { email, newLevel } = JSON.parse(event.body);

      const SUPABASE_URL = "https://dothtuwrsplezhaxkjmw.supabase.co"; 
      const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvdGh0dXdyc3BsZXpoYXhram13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NzIzMjEsImV4cCI6MjA3MTI0ODMyMX0.B13yokCG9VQ49kjZ5pHeBdqBtW7i2CP8yg2l2Ekhqnc";
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

      // Usar UPSERT para actualizar el nivel. Como email es PRIMARY KEY, actualizará el registro.
      // Pero si el usuario apenas va entrando a la app y no existe en neurosync_stats, se creará.
      const { error } = await supabase
        .from('neurosync_stats')
        .upsert({ 
            email: email,
            name: email.split('@')[0], 
            academia_level: newLevel,
            updated_at: new Date()
        }, { onConflict: 'email' });

      if (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
      }

      return { statusCode: 200, body: JSON.stringify({ success: true, newLevel }) };
  } catch(e) {
      return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
