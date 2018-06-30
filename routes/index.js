const express = require("express");
const { User } = require("../models/user");
const { mongoose } = require("../config/db/mongoose");
const { passport } = require("../config/passport");
const jwt = require('jsonwebtoken');

const router = express.Router();

router.get("/", (req, res) => {
  res.render("login");
});

router.post("/", passport.authenticate("local-signin", {
    failureRedirect: "/",
    failureFlash: true
  }),(req,res) =>{
    const token = jwt.sign(req.user.toJSON(), process.env.JWT_SECRET, {
      expiresIn: 3600
    })
    res.cookie('jwt', token);
    res.redirect('/home');
  }
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
