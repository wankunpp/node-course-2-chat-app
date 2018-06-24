const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware/isLoggedIn");

router.get("/", isLoggedIn, (req, res) => {
  res.render("room");
});

module.exports = router;
