const Campground= require('../models/campground');
const Review= require('../models/review')

module.exports.createReview= async(req, res)=>{  //to get the data as a payload from the post request that has been made
  const campground= await Campground.findById(req.params.id);
  const review= new Review(req.body.review);    //remember that we have made a parent container called review in the form that contains two different fields like review[rating] and review[review]
  review.author= req.user._id;
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  req.flash('success', 'Succesfully created a new review!');
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteReview= async(req, res)=>{
  const {id, reviewId}= req.params;

  await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId } });  //this is a mongo function ($pull) and here we are basically going in the campground with its 'id' taken from params and in that campground we are then going to that review that has the reviewId of the one that is mentioned in the params and thrn pulling it out of that array of reviews
  await Review.findByIdAndDelete(reviewId);
  req.flash('success', 'Deleted a review!');
  res.redirect(`/campgrounds/${id}`)
};
