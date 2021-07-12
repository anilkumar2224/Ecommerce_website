const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  reviews: [
    {
     name:{
            type: String,
            require:true
        },
    rating: {
        type: Number,
        default: 5,
      },
   
      comment: {
        type: String,
        require:true
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
      },
    },
  ],
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },

});

module.exports = mongoose.model("Review", reviewSchema);
