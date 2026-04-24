const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { email, password } = JSON.parse(event.body);

  if (!email || !password) {
    return { statusCode: 400, body: "Email and password are required" };
  }

  // LLAVES OFICIALES DE SUPABASE NEUROSYNC
  const SUPABASE_URL = "https://dothtuwrsplezhaxkjmw.supabase.co"; 
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvdGh0dXdyc3BsZXpoYXhram13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NzIzMjEsImV4cCI6MjA3MTI0ODMyMX0.B13yokCG9VQ49kjZ5pHeBdqBtW7i2CP8yg2l2Ekhqnc";

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // BUSCAMOS SOLO EN LA TABLA DE NEUROSYNC
  const { data: usuarios, error } = await supabase
    .from('usuarios_neurosync')
    .select('email, password')
    .eq('email', email)
    .single();

  if (error || !usuarios || usuarios.password !== password) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "Credenciales inválidas. Verifica tu acceso." }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Login exitoso!" }),
  };
};
