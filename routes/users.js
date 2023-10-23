const express = require("express");
const router = express.Router({ mergeParams: true });
const users = require("../controllers/users");
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const User = require("../models/user");
const { storeReturnTo } = require("../middleware");

// Routes ------------

router.route("/register").get(users.newUser).post(catchAsync(users.addUser));

router.get("/login", users.loginUser);

router.post(
  "/login",
  storeReturnTo,
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  users.getUser
);

router.get("/logout", users.logoutUser);

module.exports = router;
