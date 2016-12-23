var express = require('express');
var router = express.Router();
var controller = require('./siteContent.controller');


router.post('/', controller.newSiteContent);
router.get('/allContent', controller.allContent);
router.put('/:contentId', controller.updateContent);
router.delete('/:contentId', controller.deleteContent);
module.exports = router;
