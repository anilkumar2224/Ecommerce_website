const { text } = require("express");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = Schema({
  user: {
    type: Schema.Types.ObjectId,
    // type: {},
    ref: "User",
  },
  cart: {
    totalQty: {
      type: Number,
      default: 0,
      required: true,
    },
    totalCost: {
      type: Number,
      default: 0,
      required: true,
    },
    totalcodprepaid: {
      type: Number,
      default: 0,
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        qty: {
          type: Number,
          default: 0,
        },
        price: {
          type: Number,
          default: 0,
        },
        codprepaid: {
          type: Number,
          required: true,
        },
        title: {
          type: String,
        },
        productCode: {
          type: String,
        },
      },
    ],
  },
  orderType:{
    type:String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  paymentId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  Delivered: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Order", orderSchema);
