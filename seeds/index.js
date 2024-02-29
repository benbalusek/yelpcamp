"use strict";

// .env if not in production mode
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// npm packages + other files
const mongoose = require("mongoose");
const cities = require("./cities");
const {
  places,
  descriptors,
  adjective1,
  adjective2,
  noun,
} = require("./seedHelpers");
const { cloudinary } = require("../cloudinary/index.js");
const Campground = require("../models/campground");
const Review = require("../models/review");

// mongoose connection
// mongoose.connect(process.env.LOCAL_DB_URL); // local database
mongoose.connect(process.env.ATLAS_DB_URL); // atlas database
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("database connected");
});

// const userId = process.env.LOCAL_USER_ID; // local database
const userId = process.env.ATLAS_USER_ID; // atlas database

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  const campgrounds = await Campground.find({});

  // Delete from cloudinary
  for (let image of campgrounds.map((campground) => campground.images).flat()) {
    if (!image.filename.startsWith("Film/")) {
      try {
        const result = await cloudinary.uploader.destroy(image.filename);
        console.log(`Deleted: ${image.filename}`, result);
      } catch (error) {
        console.error("Failed to delete image:", image.filename, error);
      }
    }
  }

  await Campground.deleteMany({});
  await Review.deleteMany({});
  for (let i = 0; i < 100; i++) {
    // random num
    const random1000 = Math.floor(Math.random() * 1000);
    const random150 = Math.floor(Math.random() * 150) + 1;
    const price = Math.floor(Math.random() * 20) + 10;

    const camp = new Campground({
      author: userId,
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(descriptors)} ${sample(places)}`,
      description: `${sample(adjective1)}, ${sample(adjective2)}, ${sample(
        noun
      )} on ${sample(adjective1)} ${sample(noun)}`,
      price,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      images: [
        {
          url: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/v1702069435/Film/filmphoto-${random150}.jpg`,
          filename: `Film/filmphoto-${random150}`,
        },
      ],
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
