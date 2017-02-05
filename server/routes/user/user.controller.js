/**
 * Created by Danny on 12/25/16.
 */
var mongoose = require('mongoose');
var passport = require('passport');
var async = require('async');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var fs = require('fs');
var jwtSecret = 'kinetik-secret';
var _ = require('lodash');
var User = mongoose.model('User');

function newUser(req, res) {
    req.body.password = 'culture';
    var user = new User(req.body);
    user.save(function(err) {
        if(err) return res.status(500).json(err);
        else {
            delete user.password;
            return res.status(200).json(user);
        }
    })
}

function allUsers(req,res) {
    User.find({},{password:0})
        .exec(function(err, users) {
            if(err) return res.status(400).json(err);
            else return res.status(200).json(users);
        })
}

function updateUser(req, res) {
    delete req.body._id;
    User.findByIdAndUpdate(req.params.userId, req.body, {new : true})
        .exec(function(err, user) {
            if(err) return res.status(400).json(err);
            else return res.status(200).json(user);
        })
}

function deleteUser(req, res) {
    User.findByIdAndRemove(req.params.userId)
        .exec(function(err, user) {
            if(err) return res.status(400).json(err);
            else return res.status(200).json({});
        })
}

function loginUser(req, res) {
    passport.authenticate('local', function(err, user, info) {
        if(err) return res.status(400).send('Password error');
        else {
            if(!user) return res.status(401).send(info.message);
            else {
                var jwtPayload = {
                    user : user
                }
                user.password = null;
                var returnUser = {
                    user : user,
                    token : jwt.sign(jwtPayload, jwtSecret, {expiresIn : '30d'})
                }
                return res.status(200).json(returnUser);
            }
        }
    })(req, res)
}

function loginViaToken(req, res) {
    var jwtToken = req.body.jwtToken;
    jwt.verify(jwtToken, jwtSecret, function(err, decoded) {
        if(err) {
            return res.status(400).json({data : 'Expired token'});
        } else {
            req.decoded = decoded;
            var jwtPayload = {
                user : decoded.user
            }
            var returnUser = {
                user : decoded.user,
                token : jwt.sign(jwtPayload, jwtSecret, {expiresIn : '30d'})
            }
            return res.status(200).json(returnUser)
        }
    })
}

module.exports = {
    newUser : newUser,
    allUsers : allUsers,
    updateUser : updateUser,
    deleteUser : deleteUser,
    loginUser : loginUser,
    loginViaToken : loginViaToken
}
