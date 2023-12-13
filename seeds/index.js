"use strict";

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
const Campground = require("../models/campground");

// mongoose connection
mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 300; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const random150 = Math.floor(Math.random() * 150) + 1;

    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      // YOUR USER ID
      author: "656a578b1160b321800ee395",
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
          url: `https://res.cloudinary.com/ddjmamuwr/image/upload/v1701883577/YelpCamp/campground${random150}.jpg`,
          filename: `YelpCamp/campground${random150}`,
        },
      ],
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
