var
EOL = require('os').EOL,
config = require('../config.js'),
logger = require('log4js').getLogger('catdamnit'),
promise = require('bluebird');

var options = {
    promiseLib: promise,
    error: dbError
}

var pgp = require('pg-promise')(options);

function dbError(err, e){
    var errMsg = (err.message || err);
    logger.error(errMsg);
    logger.error(e);
};


/* Fix up the date formatting */
pgp.pg.types.setTypeParser(1114, (stringValue)=>{
    return stringValue.split('.')[0];
});
    
module.exports = pgp(config.database);
