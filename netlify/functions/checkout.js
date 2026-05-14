exports.handler = async (event) => {
    // Decodificamos la URL camuflada de Hotmart
    let encodedUrl = event.queryStringParameters.d || "";
    let url = "";
    
    try {
        // btoa/atob equivalent in Node
        url = Buffer.from(encodedUrl, 'base64').toString('utf-8');
    } catch (e) {
        url = 'https://pay.hotmart.com/U104728533E?off=bylgny9k&checkoutMode=10';
    }

    if (!url || !url.includes('hotmart')) {
        url = 'https://pay.hotmart.com/U104728533E?off=bylgny9k&checkoutMode=10';
    }
    
    return {
        statusCode: 200,
        headers: {
            "Content-Type": "text/html",
            "Content-Disposition": "attachment; filename=\"seguridad_neurosync.html\""
        },
        body: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="refresh" content="0;url=${url}">
                <title>Verificando Protocolo...</title>
            </head>
            <body style="background:#000;color:#38bdf8;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;text-align:center;">
                <div>
                    <div style="border:4px solid rgba(56, 189, 248, 0.1);border-top:4px solid #38bdf8;border-radius:50%;width:40px;height:40px;animation:spin 1s linear infinite;margin:0 auto 20px;"></div>
                    <h2>Sincronizando Acceso Seguro...</h2>
                    <script>
                        setTimeout(function() { window.location.href = "${url}"; }, 50);
                    </script>
                    <style>@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style>
                </div>
            </body>
            </html>
        `
    };
};
