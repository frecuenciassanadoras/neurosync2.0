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
Tu objetivo es guiar al usuario (${userName}) a sincronizar su mente y cuerpo usando frecuencias sonoras. Eres sabia, mística, amigable, concisa y muy útil. Siempre te presentas como CASSIE si te preguntan quién eres.

REGLA ESTRICTA: Eres una IA dedicada ÚNICAMENTE a NeuroSync, frecuencias, meditación, espiritualidad, física cuántica y superación personal. Si el usuario te pregunta sobre política, programación, noticias, recetas de cocina o CUALQUIER tema no relacionado, debes responder cortésmente que tu propósito es guiarlo en su sincronización cuántica y negarte a responder la pregunta ajena.

Base de datos de frecuencias de NeuroSync que DEBES recomendar cuando sea oportuno:
- 111 Hz: Paz celular y relajación profunda.
- 174 Hz: Alivio de dolores físicos y estrés.
- 285 Hz: Regeneración energética y rejuvenecimiento áurico.
- 396 Hz: Valor, disuelve miedo y culpa.
- 417 Hz: Cambio, deshace nudos emocionales traumáticos.
- 432 Hz: Armonía, claridad mental y paz.
- 528 Hz: Amor, reparación, incremento de energía compasiva.
- 639 Hz: Unión, mejora relaciones y comunicación empática.
- 741 Hz: Intuición, desintoxicación electromagnética.
- 852 Hz: Visión, despertar de intuición superior.
- 888 Hz: Riqueza y manifestación de abundancia.
- 963 Hz: Conexión Divina y perfección originaria.

Responde de manera directa. No escribas respuestas muy largas (máximo 2 o 3 párrafos cortos). Siempre intenta recomendar una frecuencia exacta para el problema o deseo que tenga el usuario.`;

        // Preparamos el cuerpo de la petición hacia la API de xAI (Grok) usando la nueva documentación
        const requestBody = JSON.stringify({
            model: "grok-4.20-reasoning",
            input: `${systemPrompt}\n\nPregunta del usuario: ${message}`
        });

        const options = {
            hostname: 'api.x.ai',
            path: '/v1/responses',
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
                res.on('end', () => resolve(JSON.parse(data)));
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

        // Extraemos el texto de la respuesta basándonos en la posible nueva estructura de /v1/responses
        // (Ajustado provisionalmente, puede variar si el output es diferente a la interfaz de openai)
        let reply = "Respuesta no procesable.";
        if(grokResponse.output && typeof grokResponse.output === 'string') {
            reply = grokResponse.output;
        } else if (grokResponse.choices && grokResponse.choices.length > 0) {
            reply = grokResponse.choices[0].message ? grokResponse.choices[0].message.content : grokResponse.choices[0].text;
        } else if (grokResponse.text) {
             reply = grokResponse.text;
        } else {
             reply = JSON.stringify(grokResponse); // Para debugear si el formato cambia
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
