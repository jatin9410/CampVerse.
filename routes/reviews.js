const express= require('express');
const router= express.Router({mergeParams: true});

const {reviewSchema}= require('../schema.js');
const Joi= require('joi');

const catchAsync= require('../utils/catchAsync');
const expressError= require('../utils/expressError');

const Review= require('../models/review');
const Campground= require('../models/campground');


const validateReviews= (req, res, next)=>{

  const{error}= reviewSchema.validate(req.body);
  if(error){
    const msg= error.details.map(el=> el.message).join(',');
    throw new expressError(msg, 400)
  }else{
    next();
  }
}



router.post('/', validateReviews,  catchAsync(async(req, res)=>{  //to get the data as a payload from the post request that has been made
  const campground= await Campground.findById(req.params.id);
  const review= new Review(req.body.review);    //remember that we have made a parent container called review in the form that contains two different fields like review[rating] and review[review]
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete('/:reviewId', catchAsync( async(req, res)=>{
  const {id, reviewId}= req.params;
  await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId } });  //this is a mongo function ($pull) and here we are basically going in the campground with its 'id' taken from params and in that campground we are then going to that review that has the reviewId of the one that is mentioned in the params and thrn pulling it out of that array of reviews
  await Review.findByIdAndDelete(reviewId);
  res.redirect(`/campgrounds/${id}`)
}));

module.exports= router;
