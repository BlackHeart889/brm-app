module.exports = {
    HOST: "localhost",
    USER: "cmonrroy",
    PASSWORD: "admin",
    DB: "test-brm",
    dialect: "postgres",
    pool: {
        max: 5, //maxmimo de conexiones
        min: 0, //minimo de conexiones
        acquire: 30000, //tiempo de espera maximo antes de que salga un timeout
        idle: 10000, //tiempo de espera en reposo
    },
};