# brm-app
Proyecto creado como prueba técnica para la postulación a la vacante Desarrollador Backend

Para ejecutar el proyecto, se deben ejecutar los siguientes comandos:

- git clone https://github.com/BlackHeart889/brm-app.git
- cd brm-app
- npm install
- cp .env.example .env

En este punto, debe crear la base de datos que usará el proyecto y asignar las credenciales en el archivo .env presente en la raiz del proyecto; una vez asignadas las credenciales, ejecutar:

- npm run migrate //crea la estructura de base de datos
- npm run dev //crea un servidor web con el puerto 8080


Si desea configurar el puerto del servidor web, lo puede hacer a través del archivo server.js presente en la raiz del proyecto.
