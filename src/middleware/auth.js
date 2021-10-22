const ensureAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/start");
  }
};

const ensureGuest = (req, res, next) => {
  if (req.isAuthenticated()) {
    res.redirect("/");
  } else {
    next();
  }
};

module.exports = {
  ensureAuth,
  ensureGuest,
};
