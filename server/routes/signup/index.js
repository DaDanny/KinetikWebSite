/**
 * Created by Danny on 1/29/17.
 */
var express = require('express');
var router = express.Router();
var controller = require('./signup.controller');

router.post('/newSignup', controller.newSignup);
router.get('/allSignups', controller.allSignups);
router.delete('/:signupId', controller.deleteSignup);

module.exports = router;
