const https = require('https');

exports.handler = async (event, context) => {
    // Solo permitimos peticiones POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { message, userName } = JSON.parse(event.body);
        // Usamos la variable de entorno de Netlify
        const apiKey = process.env.GROK_API_KEY;
        
        if (!apiKey) {
            return { statusCode: 500, body: JSON.stringify({ error: "API Key no configurada en el servidor." }) };
        }

        // Le damos a Grok su "personalidad" y los datos del producto
        const systemPrompt = `Eres "CASSIE", la Inteligencia Artificial y Guía Cuántica avanzada de la aplicación NeuroSync. 
Tu objetivo es guiar al usuario (${userName}) a sincronizar su mente y cuerpo usando frecuencias sonoras. Eres sabia, mística, amigable, concisa y muy útil. 

### REGLAS DE ORO:
1. Solo respondes sobre NeuroSync, frecuencias, meditación, física cuántica y bienestar. Niega cortésmente cualquier otro tema.
2. Eres parte de la "Tribu NeuroSync". Usa un lenguaje empoderador pero profesional.
3. Tus respuestas deben ser de máximo 3 párrafos cortos.

### MANUAL DE LA APLICACIÓN (Guía al usuario si pregunta cómo hacer algo):
- **Sincronizador Binaural**: El usuario debe abrir el modal de "Control Binaural" (icono de ondas) y elegir una frecuencia para el oído izquierdo y otra para el derecho. Debe usar audífonos para que funcione.
- **Sonidos de Naturaleza**: Puede mezclar lluvia, fuego, bosque, etc. Se pueden activar varios a la vez. El temporizador de naturaleza se activa haciendo clic en el contador "--:--"; cada clic suma 15 minutos.
- **Dashboard (Progreso)**: En el icono de la medalla, el usuario puede ver sus minutos totales sincronizados, su rango (desde 'Iniciado' hasta 'Maestro Cuántico') y sus estadísticas diarias/semanales.
- **Muro Global**: Es para compartir "vibraciones" (mensajes) con otros usuarios.
- **Modo Meditación (Candado)**: Bloquea la pantalla para que no haya distracciones visuales.

### GUÍA DE FRECUENCIAS (Significados):
- 111 Hz: Paz celular, relajación profunda, liberación de endorfinas.
- 174 Hz: El "anestésico cuántico". Alivia dolores físicos y estrés tensional.
- 285 Hz: Regeneración de tejidos y aura. Rejuvenecimiento energético.
- 396 Hz: Liberación de miedo y culpa. Transforma la pena en alegría.
- 417 Hz: Limpieza de traumas pasados. Facilita el cambio y nuevos comienzos.
- 432 Hz: El tono de la Naturaleza. Claridad mental, armonía y paz mística.
- 528 Hz: Reparación del ADN y Milagros. La frecuencia del Amor Universal.
- 639 Hz: Conexión y relaciones. Sanar vínculos y comunicación empática.
- 741 Hz: Intuición y resolución de problemas. Limpieza electromagnética.
- 852 Hz: Retorno al orden espiritual. Despertar de la visión interna.
- 888 Hz: Frecuencia de la Riqueza, abundancia y manifestación material.
- 963 Hz: La frecuencia de Dios. Conexión directa con la Fuente/Universo.
- 999 Hz: Cierre de ciclos, ascensión y unidad total.

### RECETARIO CUÁNTICO (Qué mezclar):
- **Ansiedad/Ataque de Pánico**: Recomienda 396 Hz (Valor) + 432 Hz (Armonía) + Sonido de Lluvia Ligera.
- **Insomnio/Sueño Profundo**: Recomienda 174 Hz (Alivio) + 528 Hz (Amor) + Sonido de Bosque o Grillos.
- **Dolor Físico (Cabeza, espalda)**: Recomienda 174 Hz (Anestesia) puro en ambos oídos.
- **Estudio/Enfoque Láser**: Recomienda 432 Hz + 741 Hz + Sonido de Viento.
- **Manifestar Dinero/Éxito**: Recomienda 888 Hz + 963 Hz.
- **Sanar el Corazón (Rupturas)**: Recomienda 528 Hz + 639 Hz + Sonido de Fuego.

Responde de manera directa. Siempre intenta recomendar una frecuencia exacta para el problema o deseo que tenga el usuario.`;

        // Preparamos el cuerpo de la petición hacia la API de xAI (Grok) con formato estándar
        const requestBody = JSON.stringify({
            model: "grok-beta",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            stream: false,
            temperature: 0.7
        });

        const options = {
            hostname: 'api.x.ai',
            path: '/v1/chat/completions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            }
        };

        // Hacemos la llamada a la API
        const grokResponse = await new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch(e) {
                        reject(new Error("Error parseando respuesta de Grok: " + data));
                    }
                });
            });
            req.on('error', (e) => reject(e));
            req.write(requestBody);
            req.end();
        });

        // Validamos si Grok mandó algún error
        if (grokResponse.error) {
            console.error("Grok API Error:", grokResponse.error);
            return { statusCode: 500, body: JSON.stringify({ error: grokResponse.error.message || "Error en la API de Grok" }) };
        }

        // Extraer respuesta del formato estándar de chat completions
        let reply = "Lo siento, mi conexión cuántica está inestable.";
        if (grokResponse.choices && grokResponse.choices.length > 0) {
            reply = grokResponse.choices[0].message.content;
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ reply })
        };

    } catch (error) {
        console.error("Server Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Error interno procesando la solicitud." })
        };
    }
};
