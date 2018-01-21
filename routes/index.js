var express = require('express');
var router = express.Router();
var ItemSchema = require('../models/item');
var csrf = require('csurf');
var passport= require('passport');

var csrfprotect = csrf();
router.use(csrfprotect);

router.get('/user/profile', isLoggedIn, (req,res,next) =>{
  res.render('profile'); //so renders the profile page
});

router.get('/user/logout', isLoggedIn, (req,res,next) =>{
  req.logout(); //logout function by passport
  res.redirect('/');
});


router.use('/',notLoggedIn, (req,res,next) =>{
  next();
}); //any route before that needs to be logged into, anything after that does not need to be logged into

/* GET home page. */
router.get('/', function(req, res, next) {
  //output all the items from database
  ItemSchema.find((err, results) =>{
    var itemChunks =[]; //this is the rows
    var chunkSize = 3; //this is the columns
    for(var i = 0; i<results.length; i+= chunkSize){
      itemChunks.push(results.slice(i,i+chunkSize)); //we put 3 items in the row
      //so first iteration is results.slice(0,3) which gives first 3 products
      //then we add this array to itemChunks
      //so itemChunks would look like [[item, item, item],[item,item,item]]
    }
    res.render('index', { title: 'Com Cart App' , items: itemChunks });
  });
});

//get the route for signup and add csrfprotection to it
router.get('/user/signup',(req,res,next) =>{
  var messages = req.flash('error'); //flash error message
  res.render('signup',{csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 }); //pass a csrfToken
});

//route for user sign in
router.get('/user/signin', (req,res,next) =>{
  var messages = req.flash('error'); //flash error message
  res.render('signin',{csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 }); //pass a csrfToken
});

router.post('/user/signin',passport.authenticate('local.signin',{
  successRedirect: '/user/profile',
  failureRedirect: '/user/signin',
  failureFlash: true
}));

//post router so after button is clicked in signup page
router.post('/user/signup',passport.authenticate('local.signup',{
  successRedirect: '/user/profile',
  failureRedirect: '/user/signup',
  failureFlash: true
}));

module.exports = router;

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){ //passport method
    return next();
  }
  res.redirect('/');
}

function notLoggedIn(req,res,next){
  if(!req.isAuthenticated()){ //passport method
    return next();
  }
  res.redirect('/');
}
