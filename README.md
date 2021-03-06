# PROYECTO PARA APLICACIÓN DE ELECTRON

Proyecto para crear aplicación de Electron JS con manejador de tareas Gulp y librería para ejecutar consultas SQLite precargada.

## Comandos disponibles

#### Inicializar

El comando instala las dependencias necesarias para correr el proyecto.

```bash
npm run initialize
```

#### Escuchar cambios

El siguiente comando permite procesar los archivos modificados dentro del directorio `DEV` para utilizarlos en la aplicación.

```bash
npm run tasks
```
#### Correr la aplicación

El siguiente comando permite la ejecución de la aplicación.

```bash
npm run start
```
#### Crear instalador

El siguiente comando permite construir el archivo de instalación de la aplicación. El ejecutable se genera dentro de la dirección `BUILD/dist/`

***IMPORTANTE:*** 
No se generará el instalador si la aplicación se encuentra corriendo en el proyecto.  

```bash
npm run compile
```

## Configuración adicional


#### Consultas SQLite
Para realizar consultas dentro de la base de datos local consultar las funciones presentes dentro de librería [querys](https://github.com/angeljsus/querys).
#### Recargar en automático

Para recargar la aplicación en automático permitir la ejecución de las siguientes líenas de código existentes dentro del archivo de configuración de la aplicación que se encuentra en la siguiente ruta `BUILD/app.js`
```jasvascript
require('electron-reload')(__dirname, {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
});
```
***IMPORTANTE:*** 
Es necesario que el código para recargar la aplicación este dehabilitado antes de generar el instalador. El código genera un error al ejecutar la aplicación en caso de estar habilitado.
