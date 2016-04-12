var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var expressValidator= require('express-validator')
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var mongo = require('mongodb')
var db = require('monk')('localhost/nodeblog')

var multer = require('multer');
var flash = require('connect-flash')

var routes = require('./routes/index');
var posts = require('./routes/posts');
var categories = require('./routes/categories')


var app = express();

//Use app.locals to make a global variable
app.locals.moment = require('moment');
app.locals.truncateText = function(text, length){
  var truncatedText = text.substring(0, length)
  return truncatedText
}
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//Handle File Uploads & Multipart Data
var multer = require('multer');
var upload = multer({ dest: './uploads' });

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//Express session
app.use(session({
  secret:'secret',
  saveUninitialized: true,
  resave: true
}))

// Validator, formats errors
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));


app.use(express.static(path.join(__dirname, 'public')));

//Connect-flash, setting global variable called messages that we can access in any view
app.use(flash());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//Make our db accessible to our router
app.use(function(req, res, next) {
  req.db =  db;
  next();
});

app.use('/', routes);
app.use('/posts', posts);
app.use('/categories', categories);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
