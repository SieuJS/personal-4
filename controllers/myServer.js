const passport = require("passport");
const express  = require('express');
const OAuth2Strategy = require("passport-oauth2");

const router = express.Router();
let userProfile;

passport.use(
  new OAuth2Strategy(
    {
    authorizationURL: 'http://localhost:3030/oauth/authorize',
    tokenURL: 'https://localhost:3030/oauth/token',
      clientID: "test",
      clientSecret: "client-secret",
      callbackURL: "http://localhost:3000/auth/myServer",
      passReqToCallback: true,
    },
    function (request, accessToken, refreshToken, profile, done) {
      userProfile = profile;
      return done(null, userProfile);
    }
  )
);

router.get('/', 
    passport.authenticate('myServer', {scope : ['profile', 'email']})
);


module.exports = router;