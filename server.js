
var
config = require('./config'),
express = require('express'),
exphbs = require('express-handlebars'),
session = require('express-session'),
path = require('path'),
favicon = require('serve-favicon'),
cookieParser = require('cookie-parser'),
bodyParser = require('body-parser'),
passport = require('passport'),
log4js = require('log4js'),

pgp = require('pg-promise')({promiseLib: require('bluebird')});

/* Fix the date formating for postgres */
/* TODO: Move to separate module */
pgp.pg.types.setTypeParser(1114, (stringValue)=>{
    return stringValue.split('.')[0];
});

log4js.configure(config.logging);

/* Set up app object */
var app = express();
var hbs = exphbs.create({
    partialsDir: 'views/partials/',
    extname: '.hbs'
});

/* handlebars engine setup */
app.engine('.hbs', hbs.engine);
app.set('views', __dirname + '/views');
app.set('view options', {layout: false});
app.set('view engine', '.hbs');

/* Make a namespace for our stuff */
app.locals.logger = log4js.getLogger('catdamnit');
app.locals.config = config;
app.locals.db = pgp(config.database);
app.locals.hbs = hbs;


app.use(log4js.connectLogger(log4js.getLogger("http"), { level: 'auto' }));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: false }))
    .use(cookieParser())
    .use(express.static(path.join(__dirname, '/public')))
/* Set up passport */
    .use(session({
        secret: 'Z|{~:Z|(*^$(@Y$IHJVJBVBN£@asdad/]£$%^',
        resave: true,
        saveUninitialized: true
    }))
    .use(passport.initialize())
    .use(passport.session()); /* Passport will handle login sessions */

require('./lib/auth')(passport, app.locals.db);


if(config.ssl && app.get('env') === 'development'){
/* Redirect to HTTP by default if using SSL */
    app.use(function(req, res, next) {
        if(!req.secure) {
            var justHost = req.headers['host'].split(':')[0];
            res.redirect('https://' + justHost +":" + config.SSL.port + req.url);
        }else{
            return next();
        }
    });
}

/* Routes handlers */
require('./routes/index')(app, passport);


if (app.get('env') === 'production') {
    app.enable('view cache');
}

// error handlers

app.use(function(err, req, res, next){
    var
    code = err.code,
    message = err.message;
    
    // catch 404 and display page
    if(code === 404){
        res.status(404).render('error', { message: message });
    }else{
        res.writeHead(code, message, {'content-type': 'text/plain'});
        res.end(message);
    }
});

module.exports = app;

