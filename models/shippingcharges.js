const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const shippingchargeSchema = Schema({
  cartsize: {
    type: Number,
    required: true,
  },
  shipping_charge: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Shippingcharge",shippingchargeSchema);