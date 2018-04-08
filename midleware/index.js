var Campground = require("../models/campgrounds");
var Comment = require("../models/comment");

var middlewareObj = {};

middlewareObj.checkCampgroundOwnnership = function(req,res,next){
   //check if user is logged in
   if(req.isAuthenticated()){
        
   Campground.findById(req.params.id,function(err,foundCampground){
      if(err){
         req.flash("error","Campground NOT FOUND!!");
         res.redirect("back");
      }
      else{
         //check if user created the campground
            if(foundCampground.author.id.equals(req.user._id)){
                next();
            }
            else{
               req.flash("You Don't have permission to do that");
               res.redirect("back");
            }
         }
   });
   }
   else{
      req.flash("error","You need to be logged in to do that!!");
     res.redirect("back");
   }
   
}

middlewareObj.checkCommentOwnnership = function(req,res,next){
   //check if user is logged in
   if(req.isAuthenticated()){
        
   Comment.findById(req.params.comment_id,function(err,foundComment){
      if(err){
         res.redirect("back");
      }
      else{
         //check if user created the comment
            if(foundComment.author.id.equals(req.user._id)){
                next();
            }
             else{
                req.flash("error","You don't have permission to do that!!");
               res.redirect("back");
            }
         }
   });
   }
   else{
       req.flash("error","You need to be logged in to do that!!");
     res.redirect("back");
   }
   
}
middlewareObj.isLoggedIn = function(req,res,next){
   if(req.isAuthenticated()){
      return next();
   }
   req.flash("error","You need to be logged in to do that!!");
   res.redirect("/login");
}
module.exports = middlewareObj;