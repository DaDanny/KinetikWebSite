/**
 * Created by Danny on 12/25/16.
 */
var mongoose = require('mongoose');
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

module.exports = {
    newUser : newUser,
    allUsers : allUsers,
    updateUser : updateUser,
    deleteUser : deleteUser
}
