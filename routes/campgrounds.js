const express= require('express');
const router= express.Router({mergeParams: true});
const catchAsync= require('../utils/catchAsync');
const Campground= require('../models/campground');
const Review= require('../models/review');
const Joi= require('joi');
const ejsMate= require('ejs-mate');
const flash= require('connect-flash');
const {isLoggedIn, isAuthor, validateCampgrounds}= require('../middleware');
const campgrounds= require('../controllers/campgrounds');
const multer= require('multer');
const {storage}= require('../cloudinary');     //we dont need to sepecify index.js here because we know that node automatically looks for index.js file in a folder
const upload= multer({storage});


router.route('/')
  .get(catchAsync(campgrounds.index))
  .post(isLoggedIn, upload.array('image'), validateCampgrounds, catchAsync(campgrounds.createCampground))

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
  .get(catchAsync(campgrounds.showCampground))
  .put(isLoggedIn, isAuthor, upload.array('image'), validateCampgrounds, catchAsync(campgrounds.updateCampground))
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit',isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));


module.exports= router;
