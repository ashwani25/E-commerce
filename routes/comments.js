var express = require("express");
var reviewsCrawler = require('amazon-reviews-crawler');
var router = express.Router({mergeParams:true});
var Campground = require("../models/campgrounds");
var Comment = require("../models/comment");
var middleware = require("../midleware");
//==============
//COMMENT ROUTES
router.get("/new", middleware.isLoggedIn,function(req, res) {
   
   Campground.findById(req.params.id,function(err,campground){
      if(err){
         console.log(err);
      }
      else{
          res.render("comments/new",{campground:campground}); 
              
      }
      
   });
  
});

router.post("/",middleware.isLoggedIn,  function(req,res){
   
   //lookup campground using id
   Campground.findById(req.params.id,function(err,campground){
      if(err){
         console.log(err);
         res.redirect("/campgrounds");
      }
      else{
        // console.log(req.body.comment);
         Comment.create(req.body.comment,function(err,comment){
            if(err){
               console.log(err);
            }
            else{
               //add username and id to comment
               comment.author.id = req.user._id;
               comment.author.username = req.user.username;
            //   console.log("new comments username will be"+req.user.username);
               //save comment
               comment.save();
               campground.comments.push(comment);
               campground.save();
               req.flash("success","Comment Successfully added");
               console.log(comment);
               res.redirect("/campgrounds/"+campground._id);
 
            }
            
         });
      }
      
   });
});
// EDIT COMMENT
router.get("/:comment_id/edit",middleware.checkCommentOwnnership,function(req,res){
   Comment.findById(req.params.comment_id,function(err, foundComment) {
      if(err){
         res.redirect("back")
      } 
      else{
          res.render("comments/edit",{campground_id:req.params.id,comment:foundComment});
      }
   });
  
});
//UPDATE COMMENT
router.put("/:comment_id",middleware.checkCommentOwnnership,function(req,res){
   Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,updatedComment){
      if(err){
         res.redirect("back");
      }
      else{
         res.redirect("/campgrounds/"+req.params.id);
      }
   });
});

//DESTROY COMMENT
router.delete("/:comment_id",middleware.checkCommentOwnnership,function(req,res){
   Comment.findByIdAndRemove(req.params.comment_id,function(err){
      if(err){
         res.redirect("back");
      }
      else{
         req.flash("success","Comment deleted");
         res.redirect("/campgrounds/"+req.params.id);
      }
   });
});

// reviewsCrawler('0007234406')
// .then(function(results){
//     console.log(results);
//     //res.render("campgrounds/show",{results:results});
// })
// .catch(function(err){
//     console.error(err);
// });

module.exports = router;