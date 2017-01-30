/**
 * Created by Danny on 12/25/16.
 */

var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports = new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    function(email, password, done) {
        User.findOne({email: email.toLowerCase()}, function (err, user) {
            if (err) return done(err);
            if (!user) return done(null, false, {message: 'No account found with that email.'});
            user.comparePassword(password, function (err, isMatch) {
                if (isMatch) return done(null, user);
                else return done(null, false, {message: 'Incorrect password.'});
            })
        })
    });
