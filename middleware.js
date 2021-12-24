const {campgroundSchema}= require('./schema.js');
const expressError= require('./utils/expressError');
const Campground= require('./models/campground');
const Review= require('./models/review')

module.exports.isLoggedIn= (req, res, next)=>{
  if(!req.isAuthenticated()){
    req.flash('error', "Looks like you aren't logged in!");
    req.session.returnTo= req.originalUrl;
    res.redirect('/login');
  }else{
    next();
  }
};

module.exports.validateCampgrounds= (req, res, next)=>{
  const{error}= campgroundSchema.validate(req.body);
  if(error){
    const msg= error.details.map(el=> el.message).join(',');
    throw new expressError(msg, 400)
  }else{
    next();
  }
};

module.exports.isAuthor= async(req, res, next)=>{          //middleware to check if the user that is logged in has the authority to make changes to a campground like editing or removing it or not
  const {id}= req.params;
  const campground= await Campground.findById(id);
  if(! campground.author.equals(req.user._id)){
    req.flash('error', 'You are not authorized to do that!');
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

module.exports.isReviewAuthor= async(req, res, next)=>{          //middleware to check if the user that is logged in has the authority to make changes to a campground like editing or removing it or not
  const {id, reviewId}= req.params;
  const review= await Review.findById(reviewId);
  if(! review.author.equals(req.user._id)){
    req.flash('error', 'You are not authorized to do that!');
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
}
