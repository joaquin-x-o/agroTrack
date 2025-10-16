# agroTrack

AgroTrack - Portal Web Interno

## Datos
- Alumno: Joaquín Nicolás Palacios
- DNI: 44818868
- email: jpalacios868@alumnos.iua.edu.ar

## Proyecto
AgroTrack es un portal web interno para una pyme agroindustrial ficticia. Permite consultar información básica mediante páginas estáticas, iniciar sesión de demostración y enviar formularios de contacto que se guardan en un archivo local. Está desarrollado con Node.js y sus  módulos nativos como http y fs/promises.

Para ejecutar el servidor se puede usar tanto node server.js como npm start. El puerto configurado es 3000.

## Rutas existentes del proyecto

El portal incluye las siguientes rutas:

- / muestra la página principal index.html.

- /productos o /productos.html muestra la página de productos.

- /contacto o /contacto.html muestra el formulario de contacto.

- /login o /login.html muestra el formulario de login.

- /auth/recuperar procesa los datos del login mediante POST y devuelve un HTML con los datos enviados.

- /contacto/cargar guarda los datos enviados desde el formulario de contacto en data/consultas.txt.

- /contacto/listar muestra todas las consultas almacenadas; si no hay, muestra un mensaje “Aún no hay consultas”.

- Rutas inexistentes muestran un 404 personalizado con link al inicio, y errores internos muestran un 500.


## Ejemplos de salida
Algunos ejemplos de salida son:

- Al enviar el login, se recibe un mensaje en HTML con los datos enviados.
- Al enviar una consulta de contacto, se muestra un mensaje de agradecimiento con enlaces para volver al formulario o bien para acceder a la lista de todas las consultas hechas anteriormente; en caso de que aún no hayan consultas realizadas, se mostrará una página HTML dinámica avisando de dicha situación.
- Si se intenta acceder a una ruta inexistente, aparece un mensaje de error 404 con link al inicio.

## Aclaraciones técnicas

Todas las operaciones de lectura y escritura de archivos en el servidor se realizan de forma asíncrona usando `fs.readFile`, `fs.appendFile` y `fs.stat`. Esto permite que el servidor maneje múltiples solicitudes al mismo tiempo sin bloquearse. Por ejemplo, mientras se guarda una consulta en `consultas.txt` o se lee un archivo HTML, el servidor puede seguir respondiendo a otras peticiones concurrentes.

El tipo de contenido (MIME) se determina automáticamente según la extensión del archivo (html, css, jpg, ico, mp3, mp4, pdf) para que los navegadores interpreten correctamente cada recurso. Además, se gestionan explícitamente los errores 404 (rutas no encontradas) y 500 (errores internos), manteniendo la respuesta del servidor consistente y segura.

Finalmente, la lógica de ruteo y respuesta se centraliza en funciones específicas para login y contacto, lo que permite separar responsabilidades, mantener el código ordenado y facilitar futuras ampliaciones o mantenimiento.

El archivo .gitignore incluye: node_modules.

## Colección Postman

Por último, se incluye una colección de Postman llamada "agrotrack_palacios_joaquin.postman_collection.json" para facilitar las pruebas para todas las rutas importantes, tanto GET como POST. Estas incluyen pruebas para el login, contacto, productos y manejo de errores.
