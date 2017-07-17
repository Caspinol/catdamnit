/*
  Server config
*/
var config = require('./config'),
    express = require('express'),
    exphbs = require('express-handlebars'),
    session = require('express-session'),
    path = require('path'),
    favicon = require('serve-favicon'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    log4js = require('log4js');

log4js.configure(config.logging);
var logger = log4js.getLogger('catdamnit');

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
app.locals.db = require('./lib/db');
app.locals.hbs = hbs;


app.use(log4js.connectLogger(log4js.getLogger("http"), { level: 'auto' }));

app
    .use(favicon(path.join(__dirname, 'public/images', 'favicon.ico')))
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: false }))
    .use(cookieParser())
    .use(express.static(path.join(__dirname, '/public')))
    .use(session({
        secret: 'Z|{~:Z|(*^$(@Y$IHJVJBVBN£@asdad/]£$%^',
        resave: true,
        saveUninitialized: true,
	cookie: {
		secure: true,
		expires: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
	}
    }))
    .use(passport.initialize()) /* Set up passport */
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

// error handler
app.use(function(err, req, res, next){
    var
    code = err.code | 500,
    message = err.message;
    
    // catch 404 and display page
    res.render('error', { message: message });
});

module.exports = app;
