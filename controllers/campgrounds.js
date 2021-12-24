const Campground= require('../models/campground');
const mbxGeocoding= require("@mapbox/mapbox-sdk/services/geocoding");
const {cloudinary}= require("../cloudinary");
const mapBoxToken= process.env.MAPBOX_TOKEN;
const geocoder= mbxGeocoding({ accessToken: mapBoxToken }); //this variable contains the two methods that we need, forward and backward geocoder

module.exports.index=async (req, res)=>{      //our basic index page
  const campgrounds= await Campground.find({});  //we can do this to find all the titles of all the campgrounds because we already have a list of 50 campgrounds saved in our database by the help of seeds file
  res.render('campgrounds/index', {campgrounds})
};

module.exports.renderNewForm= (req, res)=>{    //keep in mind that position of a route does matter as we know that this route /campgrounds/new has to be earlier than /campgrounds/:id because otherwise when the request of /campgrounds/new is made then the route /campgrounds/:id will treate the 'new' as some id and ofc it wont find it
  res.render('campgrounds/new')
};

module.exports.createCampground= async(req, res)=>{   //post route for creating a new campground
  const geoData= await geocoder.forwardGeocode({
    query: req.body.campground.location,
    limit: 1
  }).send()
  const campground= new Campground(req.body.campground);  //this will make a new campground model for us with its title and location fields will be set by extracting them  from the form data
  campground.geometry= geoData.body.features[0].geometry;
  campground.images= req.files.map(f => ({ url: f.path,  filename: f.filename }));
  campground.author= req.user._id;
  await campground.save();
  console.log(campground);
  req.flash('success', 'Succesfully made a new Campground!');
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground= async (req, res)=>{
  const {id}= req.params;
  const campground= await Campground.findById(id).populate({
    path: 'reviews',
    populate: {
      path: 'author'
    }
  }).populate('author') //we are populating the reviews field of the campgrounds so that we can present the different reviews that are associated with that campground
  if(!campground){
    req.flash('error', "Can't find that campground!");
    return res.redirect('/campgrounds')
  }
  res.render('campgrounds/show', {campground});
};

module.exports.renderEditForm= async (req, res)=>{
  const {id}= req.params;
  const campground= await Campground.findById(id);
  if(!campground){
    req.flash('error', 'Cannot find that campround!');
    res.redirect('/campgrounds')
  }
  res.render('campgrounds/edit', {campground});
};

module.exports.updateCampground= async (req, res)=>{  //post route for editing a campground information
  const {id}= req.params;
  console.log(req.body)
  const campground= await Campground.findByIdAndUpdate(id, {...req.body.campground});
  const imgs= req.files.map(f => ({ url: f.path,  filename: f.filename }));
  campground.images.push(...imgs);
  await campground.save();
  if(req.body.deleteImages){
    for(let filename of req.body.deleteImages){
      await cloudinary.uploader.destroy(filename);  //through this we can erase the existence of that image from our cloudinary as well
    }
    await campground.updateOne({ $pull: {images: {filename: {$in: req.body.deleteImages }}} }); //pull from the images array the file whose filename is the filename whose deletion request is received
  }
  req.flash('success', 'Succesfully updated Campground!');
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground= async(req, res)=>{     //from the show page we are goind to make a post request to this route and fake it to be a delete request, so that we can delete it
  const {id}= req.params;
  await Campground.findByIdAndDelete(id);
  req.flash('success', 'Deleted a Campground!');
  res.redirect('/campgrounds');
};
