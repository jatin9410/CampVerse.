if(process.env.NODE_ENV !== "production"){   //this line of code means that when the code is not in production mode (ie, it is in development mode) then access some values that we have defines in our .env file and store them in process.env object
  require('dotenv').config();
}


const express= require('express');
const app= express();
const path= require('path');
const mongoose= require('mongoose');
const Joi= require('joi');          //for performing validations tasks
const ejsMate= require('ejs-mate');
const {campgroundSchema, reviewSchema}= require('./schema.js');
const Campground= require('./models/campground');
const catchAsync= require('./utils/catchAsync');
const expressError= require('./utils/expressError');
const methodOverride= require('method-override');
const Review= require('./models/review');
const session= require('express-session');
const flash= require('connect-flash');
const passport= require('passport');
const LocalStrategy= require('passport-local');
const User= require('./models/user');
const {isLoggedIn, isReviewAuthor}= require('./middleware');
const reviews= require('./controllers/reviews');



app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded ({extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));


const sessionConfig={
  secret: 'thisshouldbeabettersecret',
  resave: false,
  saveuninitialized: true,
  cookie:{
    httpOnly: true,
    expires: Date.now() + 1000* 60* 60* 24* 7,       //if we want our cookie to expire in a week
    maxAge: 1000* 60* 60* 24* 7
  }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next)=>{
  res.locals.currentUser= req.user;
  res.locals.success= req.flash('success');
  res.locals.error= req.flash('error');
  next();
})


mongoose.connect('mongodb://localhost:27017/yelp-camp');


const db= mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", ()=>{
  console.log("Database connected!")
});

const validateCampgrounds= (req, res, next)=>{
  const{error}= campgroundSchema.validate(req.body);
  if(error){
    const msg= error.details.map(el=> el.message).join(',');
    throw new expressError(msg, 400)
  }else{
    next();
  }
};

const validateReview= (req, res, next)=>{

  const{error}= reviewSchema.validate(req.body);
  if(error){
    const msg= error.details.map(el=> el.message).join(',');
    throw new ExpressError(msg, 400)
  }else{
    next();
  }
}



const campgroundRoutes= require('./routes/campgrounds');
//const reviews= require('./routes/campgrounds');
const userRoutes= require('./routes/users');


app.use('/campgrounds', campgroundRoutes);
//app.use('/campgrounds/:id/reviews', reviews);
app.use('/', userRoutes);


app.get('/fakeUser', async(req, res)=>{
  const user= new User({
    email: 'kartik@gmail.com',
    username: 'kartik_rai'
  });
  const newUser= await User.register(user, 'chicken');
  res.send(newUser);
});


app.get('/', (req, res)=>{
  res.render('home')
});

app.post('/campgrounds/:id/reviews', isLoggedIn, validateReview,  catchAsync(reviews.createReview));

app.delete('/campgrounds/:id/reviews/:reviewId',isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

app.all('*', (req, res, next)=>{                        //this route will work for all the requests that do not match any request above it and it will show the error of page not found
  next(new expressError('Page Not Found', 404));   //this will send the expressError class instance as an error to the next middleware, which is an error handler and it will deal with the error by using its error message field and the statusCode field
});

app.use((err, req, res, next)=>{
  const {statusCode=500}= err;
  if(!err.message) err.message= 'Oh no, something went wrong!'
  res.status(statusCode).render('error', {err});
});

app.listen(3000, ()=>{
  console.log("LISTENING TO PORT 3000!");
});
