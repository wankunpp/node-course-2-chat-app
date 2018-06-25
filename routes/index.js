const express = require("express");
const { User } = require("../models/user");
const { mongoose } = require("../config/db/mongoose");
const { passport } = require("../config/passport");

const router = express.Router();

router.get("/", (req, res) => {
  res.render("login");
});

router.post("/", passport.authenticate("local-signin", {
    successRedirect: "/room",
    failureRedirect: "/",
    failureFlash: true
  })
);

router.get("/register", (req, res) => {
  res.render("register");
});

router.post('/register', passport.authenticate("local-register",{
  successRedirect: '/',
  failureRedirect: '/register',
  failureFlash: true,
  successFlash: true
}))

module.exports = router;
