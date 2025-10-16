const http = require('http')
const fs = require('fs/promises')

// Mapeo de extensiones de archivo a su tipo MIME (Content-Type)
const mime = {
    'html': 'text/html',
    'css': 'text/css',
    'jpg': 'image/jpg',
    'ico': 'image/x-icon',
    'mp3': 'audio/mp3',
    'mp4': 'video/mp4',
    'pdf': 'application/pdf'
}

// CREACIÓN DEL SERVIDOR
const servidor = http.createServer((req, res) => {
    // reconstrucción de la URL
    const url = new URL('http://localhost:3000' + req.url)

    // se obtiene la ruta correcta 
    const ruta = normalizarRuta(url.pathname)

    // se gestiona la respuesta según la ruta y el método HTTP
    manejarRuta(req, res, ruta)
})

// para levantar el servidor, se puede utilizar: "node server.js" o "npm start"
servidor.listen(3000)

// ENRUTAMIENTO

// detecta la ruta y el método de la petición del usuario; redirige la solicitud a la función correspondiente
async function manejarRuta(req, res, ruta) {
    console.log('Ruta: ' + ruta)

    switch (ruta) {
        case 'public/auth/recuperar':
            await procesarLogin(req, res);
            break;

        case 'public/contacto/cargar':
            await guardarConsulta(req, res)
            break;
        case 'public/contacto/listar':
            await listarConsultas(res)
            break;
        default:
            try {
                await fs.stat(ruta)
                const contenido = await fs.readFile(ruta);

                const vec = ruta.split('.')
                const extension = vec[vec.length - 1]
                const mimeArchivo = mime[extension]

                res.writeHead(200, { 'Content-Type': mimeArchivo })
                res.write(contenido)
                res.end()
            } catch (error) {
                if (error.code == 'ENOENT') {
                    res.writeHead(404, { 'Content-Type': 'text/html' })
                    res.end(mostrarMsjError404())
                } else {
                    res.writeHead(500, { 'Content-Type': 'text/html' })
                    res.end(mostrarMsjError500());

                }
            }
            break;
    }

}

// METODOS

// normaliza la ruta solicitada y la redirige al archivo HTML correspondiente
function normalizarRuta(urlPath) {
    // concatena la ruta base 'public' con la ruta solicitada
    let ruta = 'public' + urlPath;

    // redirige rutas genéricas a sus archivos HTML específicos
    if (ruta == 'public/' || ruta == 'public/inicio' || ruta == 'public/home') {
        ruta = 'public/index.html';
    } else if (ruta == 'public/login') {
        ruta = 'public/login.html';
    } else if (ruta == 'public/contacto') {
        ruta = 'public/contacto.html';
    } else if (ruta == 'public/productos') {
        ruta = 'public/productos.html';
    }

    // devuelve la ruta final normalizada
    return ruta;
}

// procesa los datos del formulario de login y devuelve una respuesta HTML
function procesarLogin(req, res) {
    let contenido = '';

    // escucha los fragmentos del cuerpo de la petición (POST)
    req.on('data', chunks => {
        contenido += chunks;
    });

    // cuando se completa la recepción del formulario
    req.on('end', function () {
        // Convierte el cuerpo recibido a un formato legible
        const formulario = new URLSearchParams(contenido);

        // obtiene los valores del formulario
        const usuario = formulario.get('usuario');
        const clave = formulario.get('clave');

        // envía una respuesta HTML con el mensaje de login exitoso
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(mostrarMsjLoginExitoso(usuario, clave));
    });
}

// guarda los datos enviados desde el formulario de contacto en un archivo de texto
async function guardarConsulta(req, res) {
    let contenido = '';

    // recolecta los datos enviados desde el formulario
    req.on('data', chunks => {
        contenido += chunks;
    });

    req.on('end', async () => {
        // convierte los datos a un formato manejable
        const form = new URLSearchParams(contenido);

        // extrae los campos enviados por el usuario
        const nombre = form.get('nombre');
        const email = form.get('email');
        const mensaje = form.get('mensaje');

        // obtiene la fecha y hora actuales
        const fecha = new Date().toLocaleDateString();
        const hora = new Date().toLocaleTimeString();

        // prepara el formato del texto que se guardará
        const entrada = `
------------------------- <br>
Fecha: ${fecha} ${hora} <br>
Nombre: ${nombre} <br>
Email: ${email} <br>
Mensaje: ${mensaje} <br>
------------------------- <br>
<hr>
`;

        try {
            // agrega la nueva consulta al archivo consultas.txt
            await fs.appendFile('data/consultas.txt', entrada);

            // devuelve una respuesta indicando éxito
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(mostrarMsjConsultaExitosa());
        } catch (error) {
            // si ocurre un error al guardar, responde con error 500
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end(mostrarMsjError500());
        }
    });
}

// lee y muestra todas las consultas almacenadas en el archivo de texto
async function listarConsultas(res) {
    try {
        // lee el contenido del archivo de consultas
        const listaConsultas = await fs.readFile('data/consultas.txt', 'utf-8');

        // devuelve las consultas en formato HTML
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(mostrarMsjConsultas(listaConsultas));
    } catch (error) {
        // si el archivo no existe o está vacío, muestra un mensaje informativo
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(mostrarMsjNoHayConsultas());
    }
}


// MENSAJES
// se centralizan los mensajes dentro de métodos para facilitar su modificación futura y mejorar su identificación/mantenimiento

function mostrarMsjError404() {
    const mensaje = `<!doctype html>
<html>
<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="/estilos.css">
    <title>Error 404</title>
</head>
<body>
    <h1>Error 404</h1>
    <img src = "https://img.freepik.com/premium-vector/404-error-page-file-found-icon-cute-green-cactus-isolated-ux-ui-vector-illustration-web-mobile-design_126267-5830.jpg" alt = "error 404">
    <p>No existe el recurso solicitado.</p>

    <br>
    <a href="/">Volver al inicio</a>
</body>
</html>`

    return mensaje

}

function mostrarMsjError500() {
    const mensaje = `<!doctype html>
<html>
<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="/estilos.css">
    <title>Error 500</title>
</head>
<body>
    <h1>Error 500</h1>
    <p>Error interno del servidor.</p>

    <br>
    <a href="/">Volver al inicio</a>

</body>
</html>`
    return mensaje
}

function mostrarMsjLoginExitoso(usuario, clave) {
    const mensaje = `<!doctype html>
            <html>
            <head>
            <meta charset="UTF-8">
            <link rel="stylesheet" href="/estilos.css">
            <title>Login exitoso</title>
            </head>
            <body>
            <h1>Datos enviados correctamente</h1>
            <p>Nombre de usuario: ${usuario}</p>
            <p>Clave: ${clave}</p>        
            <a href='/'>Volver al inicio</a>
            </body>
            </html>`

    return mensaje
}

function mostrarMsjConsultaExitosa() {
    const mensaje = `<!doctype html>
            <html lang="es">
            <head>
            <meta charset="UTF-8">
            <link rel="stylesheet" href="/estilos.css">

            <title>Gracias</title>
            </head>
            <body>
                <h1>¡Gracias por tu mensaje!</h1>
                <p>Tu consulta fue registrada correctamente.</p>
                <br>
                <a href="/contacto">Volver al formulario</a> |
                <a href="/contacto/listar">Ver todas las consultas</a>
            </body>
            </html>
        `
    return mensaje;
}

function mostrarMsjConsultas(listaConsultas) {
    const mensaje = `<!doctype html>
            <html lang="es">
            <head>
            <meta charset="UTF-8">
            <link rel="stylesheet" href="/estilos.css">
            <title>Consultas recibidas</title>
            </head>
            <body>
                <h1>Consultas realizadas</h1>
                <pre>${listaConsultas}</pre>
                <br>
                <a href="/contacto">Volver al formulario</a>
            </body>
            </html>
        `

    return mensaje
}

function mostrarMsjNoHayConsultas() {
    const mensaje = `<!doctype html>
            <html lang="es">
            <head>
            <meta charset="UTF-8">
            <title>Sin consultas</title>
            <link rel="stylesheet" href="/estilos.css">
            </head>
            <body>
                <h1>Aún no hay consultas</h1>
                <p>No hemos recibido ningún tipo de consultas por el momento<p>
                <br>
                <a href="/contacto">Volver al formulario</a>
            </body>
            </html>
        `
    return mensaje
}

console.log('Servidor web iniciado: http://localhost:3000')