const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
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
  new localStrategy((username, password, done) => {
    User.findOne({ username: username }).then(
      user => {
        if (!user) return done(null, false, { message: "Unknown User" });
        return bcrypt.compare(password, user.password).then(res => {
          if (res) return done(null, user);
          else {
            console.log(res);
            return done(null, false, { message: "Invalid Password" });
          }
        });
      },
      error => {
        return done(error);
      }
    );
  })
);

module.exports = { passport };
