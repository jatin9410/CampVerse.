//we make the seed file so that whenever we want to fill the database, we can simply require this file anywhere


const mongoose= require('mongoose');
const cities= require('./cities'); //including the cities array file so that we can access the cities!
const Campground= require('../models/campground');  //see that here we are using another '.' so that we can get out of our current folder and then get into the models folder like usual
const {places, descriptors}= require('./seedHelpers'); //importing the seedHelpers file and destructuring to get the arrays of places and the descriptors
//we will pick a random place and a random descriptor and put them together

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db= mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", ()=>{
  console.log("Database connected!")
});

const sample=  array => array[Math.floor(Math.random()*array.length)];  //this function will give any random number from the array passes into it

const seedDB= async()=>{            //we are making this function to delete the prior contents of the database and seed new values again when its called
  await Campground.deleteMany({});
  for(let i=0; i<50; i++){
    const random1000= Math.floor(Math.random()*1000);
    const price= Math.floor(Math.random()*20)+10;
    const camp= new Campground({
      author: '6180b000f3129a1eb2c45cdc',      //this is the userId for timothee_chalamet
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude
        ]
      },
      images: [
        {
          url: 'https://res.cloudinary.com/kartik09/image/upload/v1636094054/YelpCamp/zqcpc1bvjvau1baqklbv.jpg',
          filename: 'YelpCamp/zqcpc1bvjvau1baqklbv',
        },
        {
          url: 'https://res.cloudinary.com/kartik09/image/upload/v1636094054/YelpCamp/v12nygbwv8jjsumvwgzt.jpg',
          filename: 'YelpCamp/v12nygbwv8jjsumvwgzt',
        }
      ],
      description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      price
    })
    await camp.save();
  }
}

seedDB().then(()=>{   //seedDB returns a promise since its an async function
  mongoose.connection.close(); //this will close the connection once the function has completely been executed
});                                //this function will make sure that the connection of seed file is closed once it has completely been executed!!
