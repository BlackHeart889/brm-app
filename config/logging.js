const winston = require('winston');

logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.prettyPrint(),
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
});

exports.logError = (message, service, error, res) => {
    logger.log({
        level: 'error',
        message: message,
        meta: {
            service: service,
            name: error.name,
            description: error.message,
        }
    });
    return res.status(500).send({
        error: message,
    });
}