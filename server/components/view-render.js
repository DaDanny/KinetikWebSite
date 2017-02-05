/**
 * Created by Danny on 12/15/16.
 */

var path = require('path');
var staticdir = process.env.NODE_ENV === 'production' ? 'dist.prod' : 'dist.dev'; // get static files dir
var siteContentCtrl = require('./../routes/siteContent/siteContent.controller');

var baseMeta = {
    title : "Kinetik Mag",
    description : "The world's #1 place for up to date news on anything counter culture, raves, festivals, art and music.",
    image : 'https://s3-us-west-2.amazonaws.com/kinetik-images/white_background_logo-min.png',
    shareUrl : 'KinetikMag.com'
}

function renderView(req, res, next) {

    if(req.params && req.params.slug) {
        siteContentCtrl.byContentUrl(req.params.slug)
            .then(function(content) {
                var renderMeta = buildMeta(content);
                res.render('baseView', {renderMeta : buildMeta(content)});
            })
            .catch(function(err) {
                res.redirect('/');
            })
    } else {
        res.render('baseView', {renderMeta : baseMeta});
    }
}

function buildMeta(content) {
    return {
        title : capitalize(content.title),
        description : trimString(content.description),
        image : getImage(content),
        shareUrl : buildShareUrl(content)
    }
}

function trimString(string, charLimit) {
    if(!charLimit) {
        charLimit = 100;
    }
    if(string.length > charLimit) {
        return string.slice(0,100) + '...';
    } else {
        return string;
    }
}

function buildShareUrl(content) {
    return 'kinetikmag.com/' + content.contentType + '/' + content.url;
}

function getImage(content) {
    if(!content.headerImage) {
        return 'https://s3-us-west-2.amazonaws.com/kinetik-images/white_background_logo-min.png';
    } else return content.headerImage
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

module.exports = {
    renderView : renderView
}
