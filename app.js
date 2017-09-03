var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
let passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;

let session = require('express-session');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: "http://localhost:3000/auth/redirect"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(`In GoogleStrategy second arg:`);
    console.log(accessToken, refreshToken, profile);

    // here is where I would extract my app-specific info about this user
    // and then pass it on in cb as an object.
    // in this case, I'm passing all the info I get from profile on to serializeUser.

    // this is my opportunity to take any information from the profile
    // that I get from Google and pass it along to serializeUser where
    // that information will be stored in session. If I don't do anything
    // with the Google profile here, I won't get it back unless the user has
    // to re-authenticate with Google.

    // I can also store the accessToken or refreshToken somewhere if I need them
    // to make later requests against the Google API.

    return cb(null, {profile: profile['_json']})
  }
));

// serializeUser will specify what data we want to be stored in session for
// this authenticated user. It receives the user object from Google Strategy

passport.serializeUser(function(user, done) {
  console.log('in serializeUser, receives user from Google Strategy done');
  console.log(`user:`);
  console.dir(user);

  // the call to done below tells my app that I want to store the object
  // {profile. user.profile} in session.

  done(null, {profile: user.profile});
});

// id gets passed whatever Express found in the session for the cookie sent
// by the user. id is going to be assigned the object we gave as the second
// argument to done at the end of serializeUser.
passport.deserializeUser(function(id, done) {
  console.log('in deserializeUser');
  console.log(`id:`);
  console.dir(id);
  let err = null;

  // I could also use the id passed to do some sort of local database lookup
  // and get that data to place into req.user. That would save space in session.

  // now this second argument is what gets placed in req.user by passport.
  // I could place everything in req.user, but here I'm only putting the
  // displayName and the link to a Google profile image for the user.
  done(err, {displayName: id.profile.displayName, profileImage: id.profile.image.url});
});

app.use(session({ secret: 'key', // used to sign the session ID cookie
                  resave: false, // forces session to be saved, even if it didn't change
                  saveUninitialized: false, // forces an uninitialized session to be saved to the store
                })
        );

app.use(passport.initialize());
app.use(passport.session()); // be sure express-session is BEFORE passport-session


app.use('/', index);
app.use('/users', users);

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
