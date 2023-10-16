const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const Joi = require("joi");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const Campground = require("./models/campground");
const Review = require("./models/review");
const { campgroundSchema } = require("./schemas.js");
const { reviewSchema } = require("./schemas.js");
const campgrounds = require("./routes/campgrounds");
const reviews = require("./routes/reviews");

// const DB_URL =
//   "mongodb+srv://daveofderby:4tAe9svV1mRKWsCP@cluster0.hm2obzv.mongodb.net/";

const DB_URL = "mongodb://localhost:27017/yelp-camp";

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database Connected");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware ---------------------

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// Routes ------------------

app.use("/campgrounds", campgrounds);
app.use("/campgrounds/:id/reviews", reviews);

app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh no, something went wrong";
  res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
  console.log("Serving on port 3000");
});
