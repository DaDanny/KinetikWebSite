/**
 * Created by Danny on 1/21/16.
 */
var nconf = require('nconf');
var mongoose = require('mongoose');
var path = require('path');
var fs = require('fs');
var SiteContent = require('./../models/site-content.model');

module.exports = function() {

    var mongoURI = 'mongodb://freq:culture@ds133418.mlab.com:33418/serverculture-stage';
    var mongoOpts = {
        server: {
            socketOptions: {
                keepAlive: 1,
                connectTimeoutMS: 30000
            }
        },
        replset: {
            socketOptions: {
                keepAlive: 1,
                connectTimeoutMS : 30000
            }
        }
    };

    //   "MONGOLAB_URI" : "mongodb://lock:smith@ds047095.mongolab.com:47095/possessions",
    var connection = mongoose.connection;

    connection.on('connected', function() {
        console.log('Mongoose connected!');
    });

    connection.on('open' , function() {
        console.log('Connection open!');
    })

    connection.on('error', function(err) {
        console.error('Mongoose connect error: '+ err);
        mongoose.disconnect();
    })

    connection.on('disconnected', function() {
        console.log('Mongoose disconnected!');
        mongoose.connect(mongoURI, mongoOpts);
    })

    mongoose.connect(mongoURI, mongoOpts);

}
