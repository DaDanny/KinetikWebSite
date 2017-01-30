/**
 * Created by Danny on 12/15/16.
 */
var express = require('express');
var path = require('path');
var staticdir = process.env.NODE_ENV === 'production' ? 'dist.prod' : 'dist.dev'; // get static files dir
var viewRender = require('./../components/view-render');


module.exports = function(app) {

    //app.use('/api/account', require('./../routes/Account'));
    app.use('/api/siteContent', require('./../routes/siteContent'));
    app.use('/api/user', require('./../routes/user'));
    app.use('/api/signup', require('./../routes/signup'));

    var baseRoutes = ['/', '/sound', '/film', '/fashion', '/culture', '/about', '/admin', '/dashboard', '/dashboard/*', '/:type(sound|film|fashion|culture)/:slug'];
    baseRoutes.forEach(function(path) {
        app.get(path, function(req, res, next) {
            viewRender.renderView(req, res, next);
        })
    })


    //app.use('/*', function(req, res) {
    //    res.redirect('/');
    //})

    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });


    /**
     Error Handlers
     */

    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function(err, req, res, next) {
            res.status(err.status || 500);
            res.sendFile('404.html', {
                root : path.join(__dirname , '../../'+ staticdir)
            })

        });
    }

    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.sendFile('404.html', {
            root : path.join(__dirname , '../../'+ staticdir)
        })
    });
}
