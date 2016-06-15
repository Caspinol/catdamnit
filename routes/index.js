
module.exports = function(app, password){
    'use strict';

    /* Preload the common stuff */
    (function(app){
        app.use(function(req, res, next){
            app.locals.db.tx(function(t){
                return t.batch([
                    t.many("SELECT tagid, tagname FROM tags ORDER BY tagid;"),
                    t.many("SELECT t.tagid,tagname,postid,post_title "
                           +"FROM tags AS t INNER JOIN posts AS p "
                           +"ON t.tagid = p.tagid GROUP BY t.tagid,p.postid "
                           +"ORDER BY p.tagid;")
                ]);
            })
                .then((rows)=>{
                    res.locals.posts = cleanupPosts(rows[0], rows[1]);
                    res.locals.title = app.locals.config.appname;
                    res.locals.user = req.isAuthenticated()?req.user:null; 
                    next();
                })
                .catch((err)=>{
                    logger.error("Failed to load the post...");
                    logger.error(err);
                    next(err);
                });
        });
    }(app));
    
    
    var db = app.locals.db,
        logger = app.locals.logger;
    
    /* GET home page. */
    app.get('/', function(req, res, next) {
        db.one("SELECT post_title, post_content, post_date "
               +"FROM posts ORDER BY post_date desc LIMIT 1;")
            .then((post)=>{
                res.locals.post = post;
                next();
            })
            .catch((err)=>{
                logger.error("Failed to load the post...");
                logger.error(err);
            });
    }, doRender('boiler'));
    
    app.get('/newpost', loggedIn, function(req, res, next){
        db.many("SELECT tagid, tagname FROM tags;")
            .then((tags)=>{
                app.locals.hbs.getTemplate('views/partials/editor.hbs')
                    .then((t)=>{
                        res.send(t({ tags: tags, editor: true }));
                    })
                    .catch((err)=>{
                        logger.error(err);
                    });
            })
            .catch((err)=>{
                logger.error("Failed to load the tags...");
                logger.error(err);
            });
    });
    
    app.post('/newpost', loggedIn, function(req, res, next){
        db.none("INSERT INTO posts(post_title, post_content, post_author, tagid)" 
                +"VALUES($1, $2, $3, $4);",
                [req.body['post-title'], req.body['post-txt'],
                 req.user.username, req.body['post-tag']]
               )
            .then(()=>{
                res.send({ message: "Post saved" });
            })
            .catch((err)=>{
                return next(handleError({
                    code: 500,
                    message: "There was problem saving the post"
                }));
            });
        
    });

    app.get('/post/:id', function(req, res, next){
        db.one("SELECT * FROM posts WHERE postid=$1;", req.params.id)
            .then((row)=>{
                res.locals.post = row;
                next();
            })
            .catch((err)=>{
                return next(handleError({
                    code: 404,
                    message: "No page here human"
                }));
            });
    }, doRender('boiler'));

    app.get('/about', function(req, res, next){
        db.one("SELECT * FROM posts WHERE post_url=$1;", "/about")
            .then((row)=>{
                res.locals.post = row;
                next();
            })
            .catch((err)=>{
                logger.error("Failed to load the post...");
                logger.error(err);
            });
    }, doRender('boiler'));

    app.get('/profile', loggedIn, (req, res)=>{
        res.render('boiler');
    });

    app.post('/login', function(req, res, next){
        password.authenticate('local-login',
                              { failureRedirect: '/login' },
                              function(err, user, info){
                                  if(err) return next(err);
                                  if(!user) return res.status(401).json(info);
                                  req.login(user, function(err) {
                                      if (err) { return next(err); }
                                      req.session.cookie.expires = false;
                                      /* 15min session */
                                      req.session.cookie.maxAge = 1000*60*15; 
                                      res.send({redirect: '/profile',
                                                message: 'Dillon, you sonovabitch!'});
                                  });
                              })(req, res, next); 
    });
    
    app.get('/logout', function(req, res){
        req.logout();
        res.redirect('/');
    });
}

function loggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

function cleanupPosts(tags, posts){
    var p = [];
    for(var i = 0; i < tags.length; i++){
        var t = tags[i];
        t['posts'] = [];
        for(var j = 0; j < posts.length; j++){
            if(t.tagid === posts[j].tagid){
                t['posts'].push(posts[j]);
            }
        }
        p.push(t);
    };
    return p;
}

function doRender(view){
    return function(req, res, next){
        res.render(view);
    };
}

function handleError(err){
    var error = new Error(err.message);
    error.code = err.code;
    return error;
}
