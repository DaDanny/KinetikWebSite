/**
 * Created by Danny on 12/18/16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SiteContentSchema = new Schema({
    "author" : String,
    "title" : String,
    "contentType" : String,
    "subTitle" : String,
    "url" : String,
    "headerImage" : String,
    "tags" : Array,
    "publishedDate" : Date,
    "description" : String,
    "contentSections" : Array,
    "quotes" : Array,
    "audioUrls" : Array,
    "socialMedia" : Object,
    "shareUrl" : String
}, {timestamps : {}})

module.exports = mongoose.model('SiteContent', SiteContentSchema);
