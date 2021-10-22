const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email Not Valid");
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (value.length <= 6 || !value.match(/[0-9]/)) {
          throw new Error(
            "Password must contain number and be of length greater than 6"
          );
        }
      },
    },
    valid: {
      type: Boolean,
      required: true,
    },
    // friends: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "User",
    //   },
    // ],
    // sentReq: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "User",
    //   },
    // ],
    // receivedReq: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "User",
    //   },
    // ],
    avatar: {
      type: Buffer,
    },
  },
  {
    timestamps: true,
  }
);

//password hashing
userSchema.pre("save", async function () {
  const user = this;
  if (user.isModified("password")) {
    user.password = bcrypt.hashSync(user.password, 12);
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
