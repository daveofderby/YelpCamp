const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/campground");

const { campgroundSchema } = require("../schemas.js");
const { isLoggedIn } = require("../middleware");

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

const isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  console.log(campground.author == req.user._id);
  if (!campground.author.equals(req.user._id)) {
    if (req.user.username != "Admin") {
      req.flash("error", "You do not have permission to do that!");
      return res.redirect(`/campgrounds/${campground._id}`);
    }
  }
  next();
};

router.get("/new", isLoggedIn, (req, res) => {
  res.render("campgrounds/new");
});

router.post(
  "/",
  isLoggedIn,
  validateCampground,
  catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash("success", "Successfully made a new campground");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.get(
  "/",
  catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({}).populate("author");
    res.render("campgrounds/index", { campgrounds });
  })
);

router.get(
  "/:id",
  catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id)
      .populate({ path: "reviews", populate: { path: "author" } })
      .populate("author");
    if (!campground.author) {
      campground.author = "blank";
    }
    console.log(campground.author);
    if (!campground) {
      req.flash("error", "Campground not found");
      res.redirect(`/campgrounds`);
    }
    res.render("campgrounds/show", { campground });
  })
);

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    // if (!campground.author.equals(req.user_id)) {
    //   req.flash("error", "You do not have permission to do that!");
    //   return res.redirect(`/campgrounds/${campground._id}`);
    // }
    if (!campground) {
      req.flash("error", "Campground not found");
      return res.redirect(`/campgrounds`);
    }
    res.render("campgrounds/edit", { campground });
  })
);

router.put(
  "/:id",
  isLoggedIn,
  validateCampground,
  isAuthor,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    req.flash("success", "Successfully updated campground");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.delete(
  "/:id",
  isLoggedIn,
  isAuthor,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Campground deleted!");
    res.redirect(`/campgrounds`);
  })
);

module.exports = router;
