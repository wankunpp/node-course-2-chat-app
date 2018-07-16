const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtracStrategy = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");

const { User } = require("../models/user");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

passport.use(
  "local-register",
  new localStrategy(
    {
      usernameField: "username",
      passwordField: "password",
      passReqToCallback: true
    },
    (req, username, password, done) => {
      User.findOne({ username: username })
        .then(user => {
          if (user) {
            return done(null, false, req.flash('errorMessage','username already exist try new'));
          } else {
            User.findOne({ email: req.body.email }).then(email => {
              if (email) {
                return done(null, false, req.flash('errorMessage','email already exist try new'));
              } else {
                if (req.body.password.length < 6) {
                  return done(null, false, req.flash('errorMessage','password must not shorter than 6'));
                } else if (req.body.password != req.body.confirm_password) {
                  return done(null, false, req.flash('errorMessage','make sure input the same password'));
                } else {
                  const user = new User({
                    username: req.body.username,
                    email: req.body.email,
                    password: req.body.password
                  });

                  user.save().then(user => {
                      return done(null,user, req.flash('successMessage','signup successfully, now can login'));
                    })
                    .catch(e => {
                      return done(null, false, req.flash('errorMessage','Invalid Input'));
                    });
                }
              }
            });
          }
        })
        .catch(e => {
          throw e;
        });
    }
  )
);

passport.use(
  "local-signin",
  new localStrategy((username, password, done) => {
    User.findOne({ username: username }).then(
      user => {
        if (!user) return done(null, false, { message: "Unkown User" });
        bcrypt.compare(password, user.password, (err, res) => {
          if (res) return done(null, user);
          return done(null, false, { message: "Invalid Password" });
        });
      },
      error => {
        return done(error);
      }
    );
  })
);


const opts=  {};
opts.jwtFromRequest = function(req) {
  let token = null;
  if (req && req.cookies) token = req.cookies['jwt'];
  return token;
};
opts.secretOrKey = process.env.JWT_SECRET;
passport.use('jwt', new JwtStrategy(opts, (jwt_payload, done) =>{
  User.findById(jwt_payload._id).then((user) =>{
    if(user) {
      return done(null, user.toJSON());
    }
    return done(null, false,{message: 'Please login'});
  }).catch(err => done(err));
}))

module.exports = { passport };
