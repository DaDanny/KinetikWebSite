var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SignUpSchema = new Schema({
    "firstName" : String,
    "lastName" : String,
    "email" : {type:String, unique: true, dropDups: true},
    "company" : String,
    "type" : String
})

SignUpSchema.index({email : true})

module.exports = mongoose.model('Signup', SignUpSchema);
