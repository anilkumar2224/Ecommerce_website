const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const homepageSchema = Schema({
  bannerImages: {
    type: Array,
    required: true,
  
  },
    newArrivals: {
    type: Array,
    required: true,
  
  },
  bestInBruh: {
    type: Array,
    required: true,
  
  },
  trending: {
    type: Array,
    required: true,
   
  },
  youMayLike: {
    type: Array,
    required: true,
   
  },
 
});

module.exports = mongoose.model("Homepage", homepageSchema);
