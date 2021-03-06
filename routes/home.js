const express = require("express");
const router = express.Router();
const {passport} = require('../config/passport');

router.get("/", passport.authenticate('jwt', {
  session: false,
  failureRedirect: '/',
  failureFlash: true
}), (req, res) => {
  res.render("home",{user: req.user});
});

module.exports = router;
