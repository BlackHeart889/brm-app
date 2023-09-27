# brm-app
Proyecto creado como prueba técnica para la postulación a la vacante Desarrollador Backend

Requisitos:
- nodeJS v18.16.1
- npm v9.5.1
- postgreSQL 14
  
Para ejecutar el proyecto, se deben ejecutar los siguientes comandos:

- git clone https://github.com/BlackHeart889/brm-app.git
- cd brm-app
- npm install
- cp .env.example .env

En este punto, debe crear la base de datos que usará el proyecto y asignar las credenciales en el archivo .env presente en la raiz del proyecto; una vez asignadas las credenciales, ejecutar:

Para crear la estructura de base de datos:
- npm run migrate 

Para crear el servidor web (puerto 8080)
- npm run dev 

Si desea configurar el puerto del servidor web, lo puede hacer a través del archivo server.js presente en la raiz del proyecto.
