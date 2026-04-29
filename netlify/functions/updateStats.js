const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
  
  const { email, name, minutes, ghostMode } = JSON.parse(event.body);

  const SUPABASE_URL = "https://dothtuwrsplezhaxkjmw.supabase.co"; 
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvdGh0dXdyc3BsZXpoYXhram13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NzIzMjEsImV4cCI6MjA3MTI0ODMyMX0.B13yokCG9VQ49kjZ5pHeBdqBtW7i2CP8yg2l2Ekhqnc";
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // 1. Verificar si el usuario ya existe
  const { data: userStats, error: fetchError } = await supabase
    .from('neurosync_stats')
    .select('*')
    .eq('email', email)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 es "no rows returned"
    return { statusCode: 500, body: JSON.stringify({ error: fetchError.message }) };
  }

  const today = new Date().toISOString().split('T')[0];

  if (userStats) {
    // 2. Actualizar usuario existente
    let streak = userStats.streak;
    let lastDate = userStats.last_active_date;
    
    // Logica básica de racha
    if (lastDate !== today) {
        let last = new Date(lastDate);
        let now = new Date(today);
        const diffDays = Math.ceil(Math.abs(now - last) / (1000 * 60 * 60 * 24)); 
        if (diffDays === 1) streak += 1;
        else streak = 1;
    }

    const newTotal = userStats.total_minutes + (minutes || 0);

    const { error: updateError } = await supabase
        .from('neurosync_stats')
        .update({ 
            total_minutes: newTotal, 
            streak: streak, 
            last_active_date: today,
            ghost_mode: ghostMode !== undefined ? ghostMode : userStats.ghost_mode,
            name: name || userStats.name,
            updated_at: new Date()
        })
        .eq('email', email);

    if (updateError) return { statusCode: 500, body: JSON.stringify({ error: updateError.message }) };
    return { statusCode: 200, body: JSON.stringify({ success: true, total_minutes: newTotal, streak }) };

  } else {
    // 3. Crear nuevo usuario
    const { error: insertError } = await supabase
        .from('neurosync_stats')
        .insert([{ 
            email, 
            name: name || email.split('@')[0], 
            total_minutes: minutes || 0, 
            streak: 1, 
            last_active_date: today,
            ghost_mode: ghostMode !== undefined ? ghostMode : false
        }]);

    if (insertError) return { statusCode: 500, body: JSON.stringify({ error: insertError.message }) };
    return { statusCode: 200, body: JSON.stringify({ success: true, total_minutes: minutes || 0, streak: 1 }) };
  }
};
