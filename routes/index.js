'use strict';

var config = require('../config'),
    logger = require('log4js').getLogger('catdamnit'),
    s = require('../lib/sanity'),
    pdf = require('html-pdf'),
    path = require('path');

module.exports = function(app, passport){
    var db = app.locals.db;
    
    /* Preload the common stuff */
    (function(app){
        app.use(function(req, res, next){
            db.tx((t)=>{
                return t.batch([
                    t.many("SELECT tagid, tagname FROM tags ORDER BY tagid;"),
                    t.many("SELECT "
                           +"DISTINCT ON (post_title) tagid,post_title,postid,post_date "
                           +"FROM posts;")
                ]);
            })
                .then((rows)=>{
                    res.locals.tags = rows[0];
                    res.locals.posts = cleanupPosts(rows[0], rows[1]);
                    res.locals.title = config.appname;
                    res.locals.user = req.isAuthenticated()?req.user:null; 
                    next();
                })
                .catch((err)=>{
                    logger.error("Failed to load the post...");
                    logger.error(err);
                    return next(handleError({
			code: 404,
			message: "Failed to load the post"
		    }));
                });
        });
    }(app));
    
    /* GET home page. */
    app.get('/', (req, res, next)=>{
        db.one("SELECT post_title, post_content, post_date "
               +"FROM posts ORDER BY post_date desc LIMIT 1;")
            .then((post)=>{
                res.locals.post = post;
                next();
            })
            .catch((err)=>{
                logger.error(err);
                return next(handleError({
                    code: 404,
                    message: "Failed to load the post"
                }));
            });
    }, doRender('boiler'));
    
    app.get('/newpost', loggedIn, (req, res, next)=>{
        app.locals.hbs.getTemplate('views/partials/editor.hbs')
            .then((t)=>{
                res.send({
                    editor: t({ tags: res.locals.tags })
                });
            })
            .catch((err)=>{
                return next(handleError({
                    code: 404,
                    message: "Failed to load editor"
                }));
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
    
    app.get('/post/edit/:id', loggedIn, (req, res, next)=>{
        db.one("SELECT * FROM posts WHERE postid=$1;", req.params.id)
            .then((rows)=>{
                app.locals.hbs.getTemplate('views/partials/editor.hbs')
                    .then((t)=>{
                        res.send({
                            editor: t({ tags: res.locals.tags, post: rows })
                        });
                    });
            })
            .catch((err)=>{
                return next(handleError({
                    code: 404,
                    message: "No page here human"
                }));
            });
    });
    
    app.get('/post/:id', (req, res, next)=>{
        if(!s.isPostIdFine(req.params.id)){
            return next(handleError({
                code: 400,
                message: "Invalid post request. As if someone was messing with it..."
            }));
        }
        db.tx(function(t){
            return t.batch([
                t.one("SELECT * FROM posts WHERE postid=$1;", req.params.id),
                t.manyOrNone("SELECT * FROM comment WHERE postid=$1;", req.params.id)
            ])
        })
            .then((rows)=>{
                res.locals.post = rows[0];
                res.locals.comment = rows[1];
                res.locals.show_comments = true;
                next();
            })
            .catch((err)=>{
                return next(handleError({
                    code: 404,
                    message: "No page here human"
                }));
            });
    }, doRender('boiler'));
    
    app.post('/comment/save/:postid', (req, res, next)=>{
        if(!s.isPostIdFine(req.params.postid)){
            return next(handleError({
                code: 406,
                message: "STOP...hacking me!"
            }));
        }
        if(!s.isStringFine(req.body.comment_txt) || !s.isStringFine(req.body.auth_name)){
            return next(handleError({
                code: 418,
                message: "You did it. I'm a teapot!"
            }));
        }
        db.none("INSERT INTO comment(postid,comment_body,comment_author_name,"
                +"comment_author_ip,comment_author_email) VALUES($1,$2,$3,$4,$5);",
                [req.params.postid, req.body.comment_txt, req.body.auth_name, req.ip, ""])
            .then(()=>{
                res.send({message: "Comment saved!"});
            })
            .catch(err=>{
                res.status(500).send({
                    message: "Upss...i encountered monsters while saving the comment"
                });
            });
    });
    
    app.get('/about', (req, res, next)=>{
        db.one("SELECT * FROM posts WHERE post_url=$1;", "/about")
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
    
    app.get('/profile', loggedIn, (req, res)=>{
        res.render('boiler');
    });
    
    app.get('/cv', cvProtect, (req, res, next)=>{
        res.render('myCV');
    });
    
    app.get('/cv/login', (req, res, next)=>{
        res.render('myCVlogin');
    });
    
    app.post('/cv/login',
             passport.authenticate(
                 'local-login',
                 { successRedirect: '/cv',
                   failureRedirect: '/cv/login'
                 }));
    
    app.post('/login', (req, res, next)=>{
        passport.authenticate(
            'local-login',
            (err, user, info)=>{
                if(err) return next(handleError({
                    code: 401,
                    message: "Bad username or password!"
                }));
                if(!user) return next(handleError({
                    code: 401,
                    message: info.message
                }));
                req.logIn(user, (err)=>{
                    if (err) { return next(err); }
                    req.session.cookie.expires = false;
                    req.session.cookie.maxAge = 1000*60*60; 
                    res.send({redirect: '/profile'});
                });
            })(req, res, next); 
    });
    
    app.get('/cvget', (req, res)=>{
        var options = {
            format: 'A4',
            base: path.join('file://', __dirname, '../public/'),
            type: 'pdf',
            orientation: 'portrait',
            phantomArgs: '--ignore-ssl-errors=true'
        };
        
        app.locals.hbs.getTemplate('views/myCV.hbs')
            .then((t)=>{
                pdf.create(t(), options).toFile('./tmp/cv.pdf', function(err, pdf) {
                    if (err) return logger.error(err.message);
                    res.download(pdf.filename, 'cv.pdf');
                });;
            });
    });
    
    app.get('/logout', (req, res)=>{
        req.logout();
        res.redirect('/');
    });

    app.get('/cvlogout', (req, res)=>{
        req.logout();
        res.redirect('/cv');
    })
    
    app.get('*', (req, res, next)=>{
        return next(handleError({
            code: 404,
            message: "Nothing to see here human"
        }));
    });
}

function cvProtect(req, res, next){
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/cv/login');
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
    error.raw = err;
    return error;
}
