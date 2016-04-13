var express = require('express');
var router = express.Router();
var mongo = require('mongodb')
var db = require('monk')('localhost/nodeblog')   //name of our db is localhost/nodeblog

router.get('/show/:id', function(req,res, next){
  var posts = db.get('posts')
  var id = req.params.id
  posts.findById(id, function(err, post){
  res.render('show',{
    "post": post

    })
  })
})

router.get('/add',function(req, res, next){
  //to list categories in drop down
  var categories = db.get('categories')
  categories.find({},{},function(err, categories){



  res.render('addpost',{
    "title": "Add Post",
    "categories": categories
    })
  })
})

router.post('/add', function(req, res, next){
    // Ger form values

    var title    = req.body.title;
    var category = req.body.category;
    var body     = req.body.body;
    var author   = req.body.author;
    var date     = new Date();

    if(req.files && req.files.image){
        var mainImageOriginalName = req.files.image.originalname;
        var mainImageName         = req.files.image.name;
        var mainImageMime         = req.files.image.mimetype;
        var mainImagePath         = req.files.image.path;
        var mainImageExt          = req.files.image.extension;
        var mainImageSize         = req.files.image.size;
    } else {
        var mainImageName = 'noimage.png';
    }

    // Form Validation

    req.checkBody('title', 'Title field is required').notEmpty();
    req.checkBody('body','Body field is required').notEmpty();

    // Check Errors

    var errors = req.validationErrors();

    if(errors){
        res.render('addpost', {
            "erors": errors,
            "title": title,
            "body": body
        });
    } else {
        var posts = db.get('posts');

        // Submit to db
        posts.insert({
            "title": title,
            "body": body,
            "category": category,
            "date": date,
            "author": author,
            "image": mainImageName
        }, function(err, post){
            if(err){
                res.send('There was an issue submitting the post');
            } else {
                req.flash('success', 'Post Submitted');
                res.location('/');
                res.redirect('/');
            }
        });
    }


});

router.post('/addcomment', function(req, res, next){
    // Ger form values

    var name            = req.body.name;
    var email           = req.body.email;
    var body            = req.body.body;
    var postid          = req.body.postid;
    var commentdate     = new Date();



    // Form Validation

    req.checkBody('name', 'Name field is required').notEmpty();
    req.checkBody('body','Body field is required').notEmpty();
    req.checkBody('email', 'Email field is required').notEmpty();
    req.checkBody('email', 'Email is not formatted correclty').isEmail();

    // Check Errors

    var errors = req.validationErrors();

    if(errors){
        var posts = db.get('posts')
        posts.findById(postid, function(err, post){
          res.render('show', {
              "errors": errors,
              "post": post
          });
        })

    } else {
        var comment = {'name': name, 'email': email, 'body': body, 'commentdate': commentdate}
        var posts = db.get('posts')

        // Submit to db
        posts.update({
                  "_id": postid
              },{
                  $push:{
                      "comments": comment
                  }
              }, function(err, doc){
                  if(err){
                      throw err;
                  } else {
                      req.flash('success', 'Comment Added');
                      res.location('/posts/show/'+postid);
                      res.redirect('/posts/show/'+postid);
                  }
              });

          }

      });

module.exports = router;
