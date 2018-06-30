const express = require("express");
const router = express.Router();
const {passport} = require('../config/passport');

router.get("/", passport.authenticate('jwt', {
  session: false,
  failureRedirect: '/',
  failureFlash: true
}), (req, res) => {
  res.render("room-chat",{user: req.user});
});
module.exports = router;
