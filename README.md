# Nodejs-Express-Mysql-Template
![](https://img.shields.io/badge/license-MIT-blue)

Este repositorio es un template para crear API REST con express, conectadas a bases de datos MySQL o MariaDB.

### Instalación y Configuración

Para utilizar este template, primero se deben instalar todas sus dependencias con el siguiente comando:

```sh
$ npm install
```

Luego, es necesario actualizar los datos del nuevo proyecto en swaggerDefinition dentro del archivo `index.js`

Finalmente, es necesario crear un archivo `.env` con las siguientes variables de entorno:

| clave | valor | descripción |
| ----- | ----- | ----------- |
| PORT | integer | Puerto donde iniciar el servicio del API |
| HOST | string | Dirección de la base de datos |
| USER | string | Usuario de la base de datos |
| PASSWORD | string | Contraseña de la base de datos |
| DATABASE | string | Nombre de la base de datos |
| DB_PORT | integer | Puerto de la base de datos |
| SECRET | string | Clave para cifrar con JWT |

### Ejecutar servidor

Para la ejecución del servidor puede usar los siguientes comandos:

(producción)
```sh
$ npm start
```

(desarrollo)
```sh
$ npm run start:dev
```

`
Nota: se recomienda el uso de PM2 para ejecutar el servidor en el ambiente de producción.
`

License
----

MIT
