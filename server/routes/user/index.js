/**
 * Created by Danny on 12/25/16.
 */
var express = require('express');
var router = express.Router();
var controller = require('./user.controller');

router.post('/newUser', controller.newUser);
router.get('/allUsers', controller.allUsers);
router.put('/updateUser/:userId', controller.updateUser);
router.delete('/:userId', controller.deleteUser);

module.exports = router;
