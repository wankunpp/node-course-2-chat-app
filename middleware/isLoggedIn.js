const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("error", "Please login first");
    res.redirect("/");
  }
};

module.exports = { isLoggedIn };
