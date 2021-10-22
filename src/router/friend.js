const express = require("express");
const router = express.Router();
const User = require("../Model/User");
const Friend = require("../Model/Friend");
const { ensureAuth } = require("../middleware/auth");

router.get("/friends/add", ensureAuth, (req, res) => {
  res.render("friends/add");
});

router.post("/friends/add", ensureAuth, async (req, res) => {
  try {
    const friend = req.body.friend;
    const user = await User.findOne({
      $or: [{ email: friend }, { username: friend }],
    });
    if (!user || user.id === req.user.id) {
      return res.render("errors/404");
    }

    const friends = await Friend.find({
      $or: [
        {
          friend: req.user._id,
          sentReq: true,
          requestToOrFrom: user._id,
        },
        {
          friend: req.user._id,
          accepted: true,
          requestToOrFrom: user._id,
        },
        {
          friend: req.user._id,
          receivedReq: true,
          requestToOrFrom: user._id,
        },
      ],
    });
    console.log(friends);
    if (friends.length !== 0) {
      return res.render("errors/404");
    }
    const sentFriend = await Friend.create({
      friend: req.user._id,
      sentReq: true,
      requestToOrFrom: user._id,
    });
    await Friend.create({
      friend: user._id,
      receivedReq: true,
      requestToOrFrom: req.user._id,
    });
    console.log(sentFriend);
    res.redirect("/friends");
  } catch (error) {
    console.log(error);
  }
});

router.get("/friends/sent", ensureAuth, async (req, res) => {
  const sentRequests = await Friend.find({
    friend: req.user._id,
    sentReq: true,
  })
    .populate("requestToOrFrom")
    .lean();
  res.render("friends/sent", {
    sentRequests,
  });
});

router.get("/friends/received", ensureAuth, async (req, res) => {
  const receivedRequests = await Friend.find({
    friend: req.user._id,
    receivedReq: true,
  })
    .populate("requestToOrFrom")
    .lean();
  res.render("friends/received", {
    receivedRequests,
  });
});

router.put("/friends/accept/:id", ensureAuth, async (req, res) => {
  const sender = await User.findById(req.params.id);
  const sender_meta = await Friend.findOne({
    friend: sender._id,
    sentReq: true,
    requestToOrFrom: req.user._id,
  });
  const receiver_meta = await Friend.findOne({
    friend: req.user._id,
    receivedReq: true,
    requestToOrFrom: req.params.id,
  });
  if (!sender_meta || !receiver_meta) {
    return res.render("errors/500");
  }
  sender_meta.accepted = true;
  sender_meta.sentReq = false;
  await sender_meta.save();
  receiver_meta.accepted = true;
  receiver_meta.receivedReq = false;
  await receiver_meta.save();
  res.redirect("/friends");
});

router.get("/friends/chat/:id", ensureAuth, async (req, res) => {
  const friend = await Friend.findOne({
    friend: req.user._id,
    accepted: true,
    requestToOrFrom: req.params.id,
  })
    .populate("requestToOrFrom")
    .lean();
  if (!friend) {
    return res.render("errors/404");
  }
  res.render("friends/chat", {
    user: friend.requestToOrFrom,
    id: req.user.id,
    name: req.user.username,
    avatar: req.user.avatar,
  });
});

router.get("/friends/userId", ensureAuth, (req, res) => {
  res.json({ id: req.user.id });
});

module.exports = router;
