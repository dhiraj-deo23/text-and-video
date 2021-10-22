const express = require("express");
const router = express.Router();
const User = require("../Model/User");
const Friend = require("../Model/Friend");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const { ensureGuest, ensureAuth } = require("../middleware/auth");
const { verifyMail } = require("../utils/send_mail");
const sharp = require("sharp");
const multer = require("multer");
const upload = multer({
  limits: {
    fileSize: 3000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Invalid file format"));
    }
    cb(undefined, true);
  },
});

router.get("/", ensureAuth, async (req, res) => {
  const friends = await Friend.find({
    friend: req.user._id,
    accepted: true,
  })
    .populate("requestToOrFrom")
    .lean();
  res.render("index", {
    friends,
    id: req.user.id,
    name: req.user.username,
    avatar: req.user.avatar,
  });
});

router.get("/start", ensureGuest, (req, res) => {
  res.render("start", {
    layout: "login",
  });
});

router.get("/register", ensureGuest, (req, res) => {
  res.render("register", {
    layout: "login",
  });
});

router.post(
  "/register",
  ensureGuest,
  upload.single("avatar"),
  async (req, res) => {
    try {
      req.body.valid = false;
      if (req.file) {
        const buffer = await sharp(req.file.buffer)
          .resize({ width: 250, height: 250 })
          .png()
          .toBuffer();
        req.body.avatar = buffer;
      }
      const user = await User.create(req.body);

      if (user) {
        const code = require("crypto").randomBytes(3).toString("hex");
        console.log(code);
        verifyMail(req.body.email, code);
        const token = jwt.sign({ _id: user._id, code }, process.env.JWT_SECRET);
        res.cookie("jwt", token, {
          expires: new Date(Date.now() + 1000 * 60 * 10),
          httpOnly: true,
          //   secure: true,
          sameSite: true,
        });
        res.redirect(`/verify?user=${user.username}`);
      }
    } catch (error) {
      res.render("register", { error });
      console.log(error);
    }
  }
);

router.get("/verify", ensureGuest, async (req, res) => {
  try {
    const username = req.query.user;
    if (!username) {
      return res.redirect("/login");
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res.render("errors/500");
    }
    res.render("verify", {
      layout: "login",
      id: user._id,
    });
  } catch (error) {
    res.render("errors/500");
  }
});

router.post("/verify/:id", ensureGuest, async (req, res) => {
  try {
    const code = req.body.code;
    const id = req.params.id;
    const token = req.cookies.jwt;
    if (!token) {
      await User.findByIdAndDelete(req.params.id);
      return res.render("errors/error", {
        error: {
          message: "Please try again, token expired!",
          type: "TimeOut",
          direct: "/register",
          click: "",
        },
      });
    }
    const verify = jwt.verify(token, process.env.JWT_SECRET);
    if (verify._id !== id || verify.code !== code) {
      return res.render("errors/error", {
        error: {
          message: "Wrong code, please try again!",
          type: "Validation",
          direct: "#",
          click: "history.back();return false;",
        },
      });
    }
    await User.findByIdAndUpdate(
      id,
      { valid: true },
      { new: true, runValidators: true }
    );
    res.redirect("/");
  } catch (error) {
    res.render("errors/500");
  }
});

router.get("/login", ensureGuest, (req, res) => {
  res.render("login", {
    layout: "login",
  });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

router.get("/logout", ensureAuth, (req, res) => {
  req.logOut();
  res.redirect("/login");
});

module.exports = router;
