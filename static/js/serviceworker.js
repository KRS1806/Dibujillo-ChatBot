self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open('my-cache').then(function(cache) {
            // Cachea los archivos necesarios, como manifest.json y error-404.html
            return cache.addAll([
                '/manifest.json', // Añadir manifest.json al caché
                '/static/js/error-404.html', // Añadir error-404.html al caché
            ]);
        })
    );
});

self.addEventListener('fetch', function(event) {
    if (event.request.url.endsWith('/manifest.json')) {
        // Si la solicitud es para manifest.json, intenta obtenerlo del caché primero
        event.respondWith(
            caches.match('/manifest.json').then(function(cachedResponse) {
                if (cachedResponse) {
                    return cachedResponse; // Devuelve el manifest desde el caché si está disponible
                }
                return fetch(event.request) // Si no está en caché, realiza un fetch
                    .then(function(response) {
                        // Cachea el nuevo manifest.json para futuras solicitudes
                        caches.open('my-cache').then(function(cache) {
                            cache.put('/manifest.json', response.clone());
                        });
                        return response;
                    });
            }).catch(function(error) {
                console.error('Error fetching manifest:', error);
                // Si no se puede obtener el manifest.json, devuelve un mensaje de error
                return new Response('<h1>Error al cargar el manifiesto</h1>', {
                    headers: { 'Content-Type': 'text/html; charset=UTF-8' }
                });
            })
        );
    } else {
        // Para todas las demás solicitudes, maneja los errores y devuelve error-404.html desde el caché
        event.respondWith(
            fetch(event.request)
            .then(function(response) {
                return response;
            })
            .catch(async function(error) {
                console.error('Error fetching resource:', error);
                try {
                    // Intenta obtener el archivo error-404.html desde el caché
                    const cachedErrorPage = await caches.match('/static/js/error-404.html');
                    if (cachedErrorPage) {
                        return cachedErrorPage; // Si está en caché, devuélvelo
                    }
                    // Si no está en caché, realiza un fetch para obtener error-404.html
                    const errorPageResponse = await fetch('/static/js/error-404.html');
                    return errorPageResponse;
                } catch (error_1) {
                    // Si no se puede obtener el archivo, devuelve una respuesta de error simple
                    return new Response('<h1>Error al cargar la página de error</h1>', {
                        headers: { 'Content-Type': 'text/html; charset=UTF-8' }
                    });
                }
            })
        );
    }
});
