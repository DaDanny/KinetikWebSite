'use strict';

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var staticdir = process.env.NODE_ENV === 'production' ? 'dist.prod' : 'dist.dev'; // get static files dir
console.log('static: ', staticdir)

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'render-views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
require('./server/config/mongoose')();

//var viewRender = require('./server/components/view-render');
//
//app.get('/', function(req, res, next) {
//    console.log('here')
//    viewRender.renderView(req, res, next);
//    //next();
//})

app.use(express.static(__dirname + '/' + staticdir));

require('./server/config/routes')(app);

module.exports = app;
