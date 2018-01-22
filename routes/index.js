var express = require('express');
var router = express.Router();
var ItemSchema = require('../models/item');
var csrf = require('csurf');
var passport= require('passport');
var Cart = require('../models/Cart');

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

router.get('/add-to-cart/:id', (req,res,next) =>{ //we expecting id for the card hence :id
  var productId = req.params.id; //get the id
  var cart = new Cart(req.session.cart ? req.session.cart : {}); //make new Cart object and pass in old cart if exists orelse pas empty obj

  ItemSchema.findById(productId, function(err, product){
    if(err){
      return res.direct('/');
    }
      cart.add(product, product.id); //puts the product and its id could use productid as well
      req.session.cart = cart; //automatically save the cart session
      res.redirect('/');
  });
});

/* GET home page. */
router.get('/', function(req, res, next) {
  //output all the items from database
  //for no errors or successMsg
  var successMsg = req.flash('success')[0];
  ItemSchema.find((err, results) =>{
    var itemChunks =[]; //this is the rows
    var chunkSize = 3; //this is the columns
    for(var i = 0; i<results.length; i+= chunkSize){
      itemChunks.push(results.slice(i,i+chunkSize)); //we put 3 items in the row
      //so first iteration is results.slice(0,3) which gives first 3 products
      //then we add this array to itemChunks
      //so itemChunks would look like [[item, item, item],[item,item,item]]
    }
    res.render('index', { title: 'Com Cart App' , items: itemChunks, successMsg: successMsg, noMessages: !successMsg });
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

router.get('/shopping-cart',(req,res,next) =>{
  if(!req.session.cart){ //if there is no shopping cart in session
    return res.render('shopping-cart', {products: null});  //dont pass anything to the shopping cart page
    //console.log("No products in session");
  }
  //console.log(req.session.cart);
  var cart= new Cart(req.session.cart); //make a new cart object with existing cart in session
  res.render('shopping-cart',{products: cart.generateArray(), totalPrice: cart.totalPrice}); //pass in total price and items to view
});

//route for checkout button clicken
router.get('/checkout',(req,res,next) =>{
  if(!req.session.cart){
    return res.redirect('/shopping-cart');
  }
  var cart= new Cart(req.session.cart);
  var errMsg = req.flash('error')[0]; //since we only have one error at a time
  res.render('checkout',{total: cart.totalPrice, csrfToken: req.csrfToken(), errMsg: errMsg, noError: !errMsg});
});

router.post('/checkout',(req,res,next) =>{
  if(!req.session.cart){
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);
  var stripe = require('stripe')

  var stripe = require("stripe")('sk_test_JgN1YrgjEI9nXR4kmmbLc5vW');

  stripe.charges.create({
    amount: cart.totalPrice * 100,
    currency: "usd",
    source: "tok_mastercard",
    description: "Test Charge"
  },(err,charge) =>{
      if(err){
        req.flash('error',err.message);
        return res.redirect('/checkout');
      }
      req.flash('success','Successful Transaction!');
      req.session.cart =null;
      res.redirect('/');
  });
});

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
