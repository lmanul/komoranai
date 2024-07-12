const session = require('cookie-session')
const passport = require('passport')
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;

let isProd = false;

const setupAuthentication = (app) => {
  if (isProd && (!process.env.KOMORANAI_GOOGLE_CLIENT_ID || !process.env.KOMORANAI_GOOGLE_CLIENT_SECRET)) {
    console.log('Please set these two environment variables before starting ' +
                'this server: KOMORANAI_GOOGLE_CLIENT_ID and ' +
                'KOMORANAI_GOOGLE_CLIENT_SECRET. You ' +
                'can get those from https://console.cloud.google.com/apis/credentials');
    process.exit();
  }
  app.use(session({ secret: "secret", resave: false, saveUninitialized: false}));
  app.use(passport.initialize());
  app.use(passport.session());

  const authUser = (request, accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  };

   passport.use(new GoogleStrategy({
       clientID:     process.env.KOMORANAI_GOOGLE_CLIENT_ID,
       clientSecret: process.env.KOMORANAI_GOOGLE_CLIENT_SECRET,
       callbackURL:  "/auth/google/callback",
       passReqToCallback   : true,
       proxy: true,
     }, authUser));

   passport.serializeUser((user, done) => {
      done(null, user);
   });

   passport.deserializeUser((user, done) => {
     done(null, user);
   });

  app.get('/auth/google/callback', passport.authenticate( 'google', {
     successRedirect: '/',
     failureRedirect: '/login'
  }));

  app.get('/auth/google', passport.authenticate('google', {
    scope: [ 'email', 'profile' ] }
  ));
};

const checkAuthenticated = (req, res, next) => {
  if (!isProd) {
    return next();
  }
  if (req.isAuthenticated() && (!process.env.KOMORANAI_DOMAIN ||
      req.user.email.endsWith(process.env.KOMORANAI_DOMAIN))) {
    return next();
  }
  req.logOut();
  res.redirect("/login");
};

const setIsProd = (flag) => {
  console.log('Is prod:', flag);
  isProd = flag;
};

module.exports = {
  checkAuthenticated,
  setIsProd,
  setupAuthentication,
};
