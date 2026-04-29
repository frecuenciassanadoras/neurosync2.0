const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
  
  const { action, id, email, author, text, parent_id } = JSON.parse(event.body);

  const SUPABASE_URL = "https://dothtuwrsplezhaxkjmw.supabase.co"; 
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvdGh0dXdyc3BsZXpoYXhram13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NzIzMjEsImV4cCI6MjA3MTI0ODMyMX0.B13yokCG9VQ49kjZ5pHeBdqBtW7i2CP8yg2l2Ekhqnc";
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  if (action === 'like') {
    // 1. Obtener los likes actuales
    const { data: post, error: fetchError } = await supabase
        .from('neurosync_social_feed')
        .select('likes')
        .eq('id', id)
        .single();
        
    if (fetchError) return { statusCode: 500, body: JSON.stringify({ error: fetchError.message }) };
    
    // 2. Incrementar
    const newLikes = (post.likes || 0) + 1;
    
    // 3. Actualizar
    const { error: updateError } = await supabase
        .from('neurosync_social_feed')
        .update({ likes: newLikes })
        .eq('id', id);
        
    if (updateError) return { statusCode: 500, body: JSON.stringify({ error: updateError.message }) };
    
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ success: true, likes: newLikes }) };
  } else {
    // Crear post o respuesta
    const { data, error } = await supabase
      .from('neurosync_social_feed')
      .insert([{ email, author, text, parent_id, likes: 0 }])
      .select();
      
    if (error) return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data[0]) };
  }
};
