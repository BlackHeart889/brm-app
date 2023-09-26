const process = require('process');
const express = require('express');
const cors = require('cors')
const cookieSession = require('cookie-session')
const db = require('./models/index.js');
const seeder = require('./models/seeders/databaseSeeder');

const app = express();

app.use([cookieSession({
    name: 'session',
    keys: ["Secret Test BRM Session"],
    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}),cors(), express.json()]);


switch (process.argv[2])  {
    //Inicializar DB con datos base
    case '--refresh-db':
        console.log('Refreshing database...');
        db.sequelize.sync({force: true}).then(async () => {
            console.log('Initializing database...');
            await seeder.seed(db);
            console.log('Database initialized successfully.');
            process.exit();
        });
        break;

    //Sincronizar DB y servir en 8080
    default:
        console.log('Synchronizing database...');
        db.sequelize.sync().then(() => {
            console.log('Database synchronized successfully.');
            serve();
        });
        break;
}

require('./config/validations.js');
require('./routes/auth.js')(app);
require('./routes/user.js')(app);

const serve = () => {
    app.listen(8080, function () {
        console.log('Web server listening on http://127.0.0.1:8080');
    });
};