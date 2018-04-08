
var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
// for getting the home page
router.get("/",function(req,res){
   
   res.render("landing"); 
});

//AUTH ROUTES
//==============
//FOR SIGN UP
router.get("/register",function(req, res) {
   res.render("register"); 
});
router.post("/register",function(req, res) {
    var newUser = new User({username:req.body.username});
    User.register(newUser,req.body.password,function(err,user){
       if(err){
          console.log(err);
          req.flash("error",err.message);
          return res.render("register");
       }
       passport.authenticate("local")(req,res,function(){
           req.flash("success","WELCOME TO OUR ONLINE STORE "+user.username);
          res.redirect("/campgrounds");
       });
    });
});

//FOR LOGIN
router.get("/login",function(req, res) {
   res.render("login"); 
});
//Handling login logic
router.post("/login",passport.authenticate("local",{
   successRedirect:"/campgrounds",
   failureRedirect:"/login"
}) ,function(req, res) {
   
});
//Logout
router.get("/logout",function(req, res) {
   
   req.logout();
   req.flash("success","Logged out");
   res.redirect("/campgrounds");
});



module.exports = router;