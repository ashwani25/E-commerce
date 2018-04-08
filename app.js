var express = require("express");
var app = express();
var bodyParser= require("body-parser");
var mongoose = require("mongoose");
var Campground = require("./models/campgrounds");
var seedDB = require("./seeds");
var Comment = require("./models/comment");
var User = require("./models/user");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var methodOverride = require("method-override");
//var AmazonReviews = require('amazon-reviews');
//var amazonCustomerReviews = require("amazon-customer-reviews");
var reviewsCrawler = require('amazon-reviews-crawler');
var sentiment = require('sentiment');
var campgroundRoutes = require("./routes/campgrounds.js");
var commentRoutes = require("./routes/comments.js");
var indexRoutes = require("./routes/index.js");
var flash = require("connect-flash");

mongoose.connect("mongodb://localhost/yelp_camp_v11");

// mongoose.connect("mongodb://piyush:tuffy@ds035683.mlab.com:35683/yelpcamp");
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(flash());

//seedDB(); //seed the database

//PASSPORT CONFIG
app.use(require("express-session")({
   secret:"im the best",
   resave:false,
   saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});
app.use("/campgrounds" ,campgroundRoutes);
app.use("/campgrounds/:id/comments" ,commentRoutes);
app.use("/" ,indexRoutes);

 
// app.listen(process.env.PORT,process.env.IP,function(){
   
//    console.log("server started");

   app.listen(3000, function (req, res) {
    console.log("server started");
});