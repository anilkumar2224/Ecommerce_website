const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const couponcodeSchema = Schema({
  coupon: {
    type: String,
    required: true,
    unique:true
  },
  pricedrop: {
    type: Number,
    required: true,
  },
  minamount: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Coupon",couponcodeSchema);