var express = require('express');
var router = express.Router();
var mongo = require('mongodb')
var db = require('monk')('localhost/nodeblog')   //name of our db is localhost/nodeblog

//homepage blog posts
router.get('/', function(req, res, next) {

});
module.exports = router;
