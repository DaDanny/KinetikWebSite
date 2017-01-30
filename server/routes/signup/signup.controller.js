/**
 * Created by Danny on 1/29/17.
 */
var mongoose = require('mongoose');
var Signup = mongoose.model('Signup');

function newSignup(req, res) {
    var signup = new Signup(req.body);
    signup.save(function(err) {
        if(err) return res.status(500).json(err);
        else {
            return res.status(200).json(signup);
        }
    })
}

function allSignups(req,res) {
    Signup.find({})
        .exec(function(err, signups) {
            if(err) return res.status(400).json(err);
            else return res.status(200).json(signups);
        })
}


function deleteSignup(req, res) {
    Signup.findByIdAndRemove(req.params.signupId)
        .exec(function(err, signup) {
            if(err) return res.status(400).json(err);
            else return res.status(200).json({});
        })
}

module.exports = {
    newSignup : newSignup,
    allSignups : allSignups,
    deleteSignup : deleteSignup
}
