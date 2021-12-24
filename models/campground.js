const mongoose= require('mongoose');
const Review= require('./review');
const Schema= mongoose.Schema;

const ImageSchema= new Schema({
  url: String,
  filename: String
});

ImageSchema.virtual('thumbnail').get(function() {
  return this.url.replace('/upload', '/upload/w_170');
});

const CampgroundSchema= new Schema({
  title: String,
  images: [ImageSchema],
  geometry: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  price: Number,
  description: String,
  location: String,
  author:{
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviews: [{                  //so this will contain a bunch of different object ids that in turn correspond to different reviews about that campground
    type: Schema.Types.ObjectId,
    ref: 'Review'
  }]
});

CampgroundSchema.post('findOneAndDelete', async function(doc){  //we are defining our middleware that will work when a camp is deleted and therefore we must remove all the associated reviews to that campground from our Review collection
  if(doc){                                                      //we are using findOneAndDelete because from the docs, it is the middleware that is invoked by default by mongoose when the function findByIdAndDelete is used to delete something from the mongo collection. And since we know that to delete the campground we deleted was through findByIdAndDelete, thus we are using this specific middleware
    await Review.deleteMany({                  //we check if there is anything that is deleted, and if so then we are deleting all the reviews that are in the
      _id: {
        $in: doc.reviews
      }
    })
  }
})

module.exports= mongoose.model('Campground', CampgroundSchema);
