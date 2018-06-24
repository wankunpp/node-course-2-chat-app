const express = require("express");
const { User } = require("../models/user");
const { mongoose } = require("../config/db/mongoose");
const { passport } = require("../config/passport");

const router = express.Router();

router.get("/", (req, res) => {
  res.render("login");
});

router.post(
  "/",
  passport.authenticate("local", {
    successRedirect: "/room",
    failureRedirect: "/",
    failureFlash: true
  })
);

router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const confirm_password = req.body.confirm_password;

  User.findOne({ username })
    .then(user => {
      if (user) {
        return res.render("register", {
          errorMessage: "username already exist try new"
        });
      } else {
        User.findOne({ email }).then(email => {
          if (email) {
            return res.render("register", {
              errorMessage: "email already exist try new"
            });
          } else {
            if (password.length < 6) {
              return res.render("register", {
                errorMessage: "password must not shorter than 6"
              });
            } else if (password !== confirm_password) {
              return res.render("register", {
                errorMessage: "make sure input the same password"
              });
            } else {
              const user = new User({
                username: req.body.username,
                email: req.body.email,
                password: req.body.password
              });

              user
                .save()
                .then(user => {
                  req.flash(
                    "successMessage",
                    "signup successfully, now can login"
                  );
                  res.redirect("/");
                })
                .catch(e => {
                  return res.render("register", {
                    errorMessage: "Invalid input"
                  });
                });
            }
          }
        });
      }
    })
    .catch(e => {
      res.render("register", { errorMessage: "something went wrong" });
    });
});

module.exports = router;
