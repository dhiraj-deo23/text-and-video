const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../Model/User");
const bcrypt = require("bcryptjs");

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user) {
        console.log("Username not found!");
        return done(null, false, { message: "Username not found!" });
      }
      if (!user.valid) {
        return done(null, false, { message: "verify your account" });
      }
      const isMatch = bcrypt.compareSync(password, user.password);
      if (!isMatch) {
        console.log("Incorrect username/password!");
        return done(null, false, {
          message: "Incorrect username/password",
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});
