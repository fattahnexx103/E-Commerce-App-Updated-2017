var passport = require('passport');
var User = require('../models/User');
var localStrategy = require('passport-local').Strategy;

//how to store user in session
passport.serializeUser((user,done) =>{
  done(null,user.id); //use user id
});

//how to retrieve user
passport.deserializeUser((id, done) =>{
  User.findById(id, (err, user) =>{
    done(err, user); //if error then error or user then user
  });
});

passport.use('local.signup', new localStrategy({ //takes 2 args, first is config and second is callback
  usernameField: 'email', //usernameField would be email
  passwordField: 'password', //passwordField is password
  passReqToCallback: true //pass the request to callback
},(req,email,password,done)=>{
  //use validator to validate email
  req.checkBody('email','Invalid email').notEmpty().isEmail();
  req.checkBody('password','Password length must be more than 4 characters').notEmpty().isLength({min:4});
  //error handling for validator
  var errors = req.validationErrors();
  if(errors){
    var messages = [];
    //create array of err messages
    errors.forEach((error) =>{
      messages.push(error.msg);
    });
    return done(null, false, req.flash('error', messages)); //send that message array to the error field in UI
  }
  User.findOne({'email': email}, (err,user) =>{ //find user by email
    if(err){ //if cannot find user
      return done(err); //not successful so done
    }
    if(user){ //if found user in database so done since we dont need to create one
      return done(null, false, {message: 'Email already in use.'});
    }//else creaste new user
    var newUser = new User();
    newUser.email = email;
    newUser.password = newUser.encryptPassword(password);
    newUser.save((err,result) =>{
      if(err){
        return done(err);
      }
      return done(null, newUser);
    });
  });
}));

passport.use('local.signin', new localStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
},(req,email,password,done) =>{
  //some quick validation like before
  req.checkBody('email','Invalid email').notEmpty().isEmail();
  req.checkBody('password','Invalid password').notEmpty();
  //error handling for validator
  var errors = req.validationErrors();
  if(errors){
    var messages = [];
    //create array of err messages
    errors.forEach((error) =>{
      messages.push(error.msg);
    });
    return done(null, false, req.flash('error', messages));
  }
  User.findOne({'email': email}, (err,user) =>{ //find user by email
    if(err){ //if cannot find user
      return done(err); //not successful so done
    }
    if(!user){ //if found user in database so done since we dont need to create one
      return done(null, false, {message: 'No User found'});
    }//else creaste new user
    if(!user.validPassword(password)){
      return done(null,false, {message: 'Wrong password'});
    }
    return done(null, user);
  });
}));
