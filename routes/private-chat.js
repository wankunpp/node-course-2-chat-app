const express = require("express");
const router = express.Router();
const {passport} = require('../config/passport');

router.get("/:id", passport.authenticate('jwt', {
  session: false,
  failureRedirect: '/',
  failureFlash: true
}), (req, res) => {
    res.render("private-chat",{user: req.user});
});
module.exports = router;