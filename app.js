var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var flash = require('connect-flash');
var mongoose = require('mongoose');
var session = require('express-session');
var validator = require('express-validator');
var MongoStore = require('connect-mongo')(session);
var index = require('./routes/index');
//import express handlebars
var handleBars = require('express-handlebars');

//import credentials
var keys = require('./creds/keys.js');
var app = express();

//set up mongoose here
mongoose.connect(keys.mongoURI, (err)=>{
  if(err){
    console.log(err);
  }else{
    console.log("Connected to database");
  }
}); //the url we obtain from creds folder

//for passport
require('./config/passport');

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', handleBars({defaultLayout: 'layout', extname: '.hbs'}));
app.set('view engine','.hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//put validator after body parser
app.use(validator());
app.use(cookieParser());
//config fr session
//saveUninitialized is false because if it is true then it would be a session even if we didnt do anything
app.use(session({secret: 'mysupersecret',
resave: false,
saveUninitialized: false,
store: new MongoStore({mongooseConnection: mongoose.connection}), //put the session in mongodb using mongoose
cookie: {maxAge: 180 * 60 * 1000} //180 minutes is the session expiration timer
})); //if true then it is saved on each server
app.use(flash());//flash messages are stored in sessions and pop up to user and then go away such as errors
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public'))); //path middleware

app.use((req,res,next) =>{
  res.locals.login = req.isAuthenticated();
  res.locals.session = req.session; //we can access sessions direct from template
  next();
}); //this is used for navigation bar on top right to change to user logins so we use the req.locals.login to check isAuthenticated

app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
