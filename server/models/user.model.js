/**
 * Created by Danny on 12/25/16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var UserSchema = new Schema({
    "email" : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim: true
    },
    firstName : String,
    lastName : String,
    role : String,
    groups : Array,
    socialMedia : Object,
    aboutMe : String,
    "password" : {type : String, required : false},
    "passwordResetToken" : String,
    "passwordResetExpires" : Date
}, {timestamps : {}})

UserSchema.pre('save', function(next) {
    var user = this;
    var saltFactor = 10;

    if(user.isModified('password')) {
        hashPassword();
    } else {
        next();
    }

    function hashPassword(){
        if(!user.isModified('password')) return next();

        bcrypt.genSalt(saltFactor, function(err, salt) {
            if(err) return next(err);

            bcrypt.hash(user.password, salt, null, function(err, hash) {
                if(err) return next(err);

                user.password = hash;
                next();
            })
        })
    }
})

UserSchema.methods.comparePassword = function(candidatePassword, callback) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if(err) return callback(err);
        callback(null, isMatch);
    })
};

module.exports = mongoose.model('User', UserSchema);
