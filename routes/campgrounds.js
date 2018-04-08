var express = require("express");
var router = express.Router();
var Campground = require("../models/campgrounds");
var middleware = require("../midleware");
var reviewsCrawler = require('amazon-reviews-crawler');
var sentiment = require('sentiment');

// get the index page
router.get("/" ,function(req,res){
   
 
   // to show all campgrounds from the db
   Campground.find({},function(err,allCampgrounds){
      if(err){
         console.log(err);
      }
      else{
          res.render("campgrounds/index",{campgrounds:allCampgrounds, currentUser:req.user});
      }
   });
   
});
// to create a new campground 
router.post("/",middleware.isLoggedIn,function(req,res){
   

var name = req.body.name;
var image = req.body.image;
var desc = req.body.description;
var asin = req.body.asin;
var author = {
  id:req.user._id,
  username:req.user.username
};

var newCampground = {name:name,image:image,description:desc,author:author,asin:asin};
console.log(req.user);
//create a new campground and add to db
Campground.create(newCampground,function(err,newlyCreated){
   if(err){
      console.log(err);
   }
   else{
      //console.log(newlyCreated);
      res.redirect("/campgrounds");
   }
   
});

});
// for displaying the form to add a new campground
router.get("/new",middleware.isLoggedIn,function(req,res){
   
   res.render("campgrounds/new");
});


// for displaying the campground with the specific id 
router.get("/:id",function(req, res) {
   //find the campground with the provided id
   Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
      if(err){
         console.log(err);
      }
      else{
        console.log(foundCampground.asin);
        reviewsCrawler(foundCampground.asin)
        .then(function(results){
           foundCampground.fakeComments = results.reviews;
           total=0;
           count=0;
           console.log(foundCampground.fakeComments);
           foundCampground.fakeComments.forEach(function(comment){
                console.log(comment.text);
                var r1 = sentiment(comment.text);
                     console.dir(r1.comparative);
                     total=r1.comparative+total;
                     count=count+1;
           });
           console.log(total/count);
        //    var sentimentValue=total/count;
        //    foundCampground.sentimentValue=sentimentValue;
            res.render("campgrounds/show",{campground:foundCampground});
        })
        .catch(function(err){
            console.error(err);
        });
        //console.log(foundCampground);
         //render show template with that campground
      }
      
   });
  
});
//EDIT ROUTE
router.get("/:id/edit",middleware.checkCampgroundOwnnership,function(req,res){
  
   Campground.findById(req.params.id,function(err,foundCampground){
     
        res.render("campgrounds/edit",{campground:foundCampground});
         
                });
   
});
//UPDATE ROUTE
router.put("/:id",middleware.checkCampgroundOwnnership,function(req,res){
   //find and update the found campground
   Campground.findByIdAndUpdate(req.params.id,req.body.campground,function(err,updatedCampground){
      if(err){
         res.redirect("/campgrounds");
      }
      else{
          //render somewhere(showPage)
         res.redirect("/campgrounds/"+req.params.id);
      }
   });
  
});
//DESTROY CAMPGROUND
router.delete("/:id",middleware.checkCampgroundOwnnership,function(req,res){
   Campground.findByIdAndRemove(req.params.id,function(err){
      if(err){
         res.redirect("/campgrounds");
      }
      else{
         res.redirect("/campgrounds");
      }
   });
});


module.exports = router;