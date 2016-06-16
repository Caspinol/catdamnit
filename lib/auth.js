'use strict'

var LocalStrategy = require('passport-local').Strategy,
    bcrypt = require('bcrypt-nodejs');

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
            var usernameRegex = /^[a-zA-Z0-9]+$/;
            if(username.match(usernameRegex) == null){
                return done(null, false, {message: "Bad username format" });
            }
            db.one("SELECT * FROM users WHERE username = $1", username)
                .then(function(rows){
                    console.log(rows);
                    if (rows == undefined || rows == null) {
                        /* Flash message if no user */
                        return done(null, false, {message: "Bad username"});
                    }
                    /* Check hashed password */
                    if (!bcrypt.compareSync(password, rows.password))
                        return done(null, false, {message: "Bad password"});
                    /* Success */
                    return done(null, rows);
                })
                .catch(function(err){
                    return done(err);
                });
        })
    );
}
