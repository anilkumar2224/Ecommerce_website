const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const blogSchema = Schema({
  blogCode: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  imagePath: {
    type: String,
    required: true,
  },
  blog_category: {
    type: String,
    required: true,
  }, 
  description: {
    type: String,
    required: true,
  },
  preview: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Blog", blogSchema);
