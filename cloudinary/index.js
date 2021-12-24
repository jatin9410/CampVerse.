const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

const storage= new CloudinaryStorage({       //we are basically setting up an instance of the cloudinary storage here
  cloudinary,                 //cloudinary object that we had just configured!
  params: {
    folder: 'YelpCamp',
    allowedFormats: ['jpeg', 'png', 'jpg']
  }

});

module.exports= {
  cloudinary,
  storage
};
