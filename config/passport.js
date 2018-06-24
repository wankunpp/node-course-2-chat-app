const passport = require("passport");
const localStrategy = require("passport-local").Strategy;

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
        if (user.password !== password)
          return done(null, false, { message: "Invalid Password" });
        else {
          return done(null, user);
        }
      },
      error => {
        return done(error);
      }
    );
  })
);

module.exports = { passport };
