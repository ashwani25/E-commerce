var mongoose = require("mongoose");
var Campground = require("./models/campgrounds");
var Comment = require("./models/comment");

var data=[
    {
        name:"cloud rest",
        image:"https://farm8.staticflickr.com/7252/7626464792_3e68c2a6a5.jpg",
        description:"It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', mak"
    },
    {
        name:"desert sand",
        image:"https://farm4.staticflickr.com/3872/14435096036_39db8f04bc.jpg",
        description:"It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', mak"
    },
    {
        name:"roadside ",
        image:"https://farm3.staticflickr.com/2259/2182093741_164dc44a24.jpg",
        description:"It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', mak"
    }
    
    ];
    
function seedDB(){
    //remove all campgrounds
Campground.remove({},function(err){
  if(err){
      console.log(err);
       
  } 
  console.log("removed campgrounds");
  //add new campgrounds
  data.forEach(function(seed){
      Campground.create(seed,function(err,campground){
          if(err){
              console.log(err);
          }
          else {
              console.log("campground added");
              //create a new Comment
              Comment.create({
                  text:"this is a great place to camping",
                  author:"garg"
              },function(err,comment){
                  if(err){
                      console.log(err);
                  }
                  else{
                      campground.comments.push(comment);
                      campground.save();
                      console.log("comment added");
                  }
              });
              }
      });
  });
   
    
});
}
module.exports = seedDB;
