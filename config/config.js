require('dotenv').config();
module.exports = {
    HOST: process.env.DB_HOST,
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PASSWORD,
    DB: process.env.DB_NAME,
    dialect: "postgres",
    pool: {
        max: 5, //maxmimo de conexiones
        min: 0, //minimo de conexiones
        acquire: 30000, //tiempo de espera maximo antes de que salga un timeout
        idle: 10000, //tiempo de espera en reposo
    },
};