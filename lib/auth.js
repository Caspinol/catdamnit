'use strict'

var LocalStrategy = require('passport-local').Strategy,
    bcrypt = require('bcrypt-nodejs'),
    v = require('../lib/sanity');

module.exports = function(passport, db){
    
    passport.serializeUser(function(user, done) {
        done(null, user.userid);
    });
    
    passport.deserializeUser(function(id, done) {
        db.one("SELECT * FROM users WHERE userid = $1 ", id)
            .then(function(row){
                done(null, row);
            })
            .catch(function(err){
                done(err);
            });
    });
    
    passport.use(
        'local-login',
        new LocalStrategy(function(username, password, done) {
            if(!v.isStringFine(username)){
                return done(null, false, {message: "Bad username or password!"});
            }
            console.log("Kurwa mac: ", username)
            db.oneOrNone("SELECT * FROM users WHERE username = $1", username)
                .then(function(rows){
                    if (rows == undefined || rows == null) {
                        /* Flash message if no user */
                        return done(null, false, {message: "Bad username or password!"});
                    }
                    /* Check hashed password */
                    if (!bcrypt.compareSync(password, rows.password))
                        return done(null, false, {message: "Bad username or password!"});
                    /* Success */
                    return done(null, rows);
                })
                .catch(function(err){
                    return done(err);
                });
        })
    );
}
