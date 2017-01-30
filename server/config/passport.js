/**
 * Created by Danny on 12/25/16.
 */
var SiteContent = require('./../models/site-content.model');
var Signup = require('./../models/site-signup.model');
var User = require('./../models/user.model');
var local = require('./passport-strategies/local');

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        done(null, user.email);
    });

    passport.deserializeUser(function(email, done) {
        User.findOne({email: email}, function(err, user) {
            done(err, user);
        });
    });

    passport.use(local);
}
