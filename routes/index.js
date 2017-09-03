var express = require('express');
var router = express.Router();

let passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;


/* GET home page. */
router.get('/', function(req, res, next) {
  if( req.user ) {
    console.log(`req.user:`);
    console.log(req.user);
    res.render('index', { title: 'Express', user: req.user.displayName, profileImage: req.user.profileImage})
  } else {
    res.render('index', { title: 'Express', user: 'Anonymous', profileImage: '' });
  }
});

// this is the route we hit to initiate the auth with google
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));


// this is the redirect that Google calls once the user has passed Google Auth.
router.get('/auth/redirect',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

module.exports = router;
