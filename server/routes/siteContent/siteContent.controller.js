/**
 * Created by Danny on 12/19/16.
 */
var mongoose = require('mongoose');
var SiteContent = mongoose.model('SiteContent');

function newSiteContent(req, res) {
    var newContent = new SiteContent(req.body)
    newContent.save(function(err) {
        if(err) return res.status(400).json(err);
        else return res.status(200).json(newContent);
    })
}

function allContent(req, res) {
    SiteContent
        .find({})
        .exec(function(err, content) {
            if(err) return res.status(400).json(err);
            else return res.status(200).json(content);
        })
}

function updateContent(req, res) {
    var contentId = req.params.contentId;
    delete req.body._id;
    SiteContent.findByIdAndUpdate(contentId, req.body)
        .exec(function(err, content) {
            if(err) return res.status(500).json(err);
            else return res.status(200).json(content);
        })
}

function deleteContent(req, res) {
    SiteContent.findByIdAndRemove(req.params.contentId)
        .exec(function(err) {
            if(err) return res.status(400).json(err);
            else return res.status(200).json({});
        })
}

function byContentUrl(contentUrl) {
    return SiteContent.findOne(
        {url : contentUrl}
    )
}
module.exports = {
    newSiteContent : newSiteContent,
    allContent : allContent,
    byContentUrl : byContentUrl,
    updateContent : updateContent,
    deleteContent : deleteContent
}
