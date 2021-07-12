const { unique } = require("faker");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const slug = require("mongoose-slug-updater");

const productSchema = Schema({
  productCode: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  imagePath:{
    type: Array,
    required: true,
  },
  short_description: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  description_use_first: {
    type: String,
    required: true,
  },
  description_use_second: {
    type: String,
    required: true,
  },
  description_use_third: {
    type: String,
    required: true,
  },
  specific_type: {
    type: String,
    required: true,
  },
  specific_ingredients: {
    type: String,
    required: true,
  },
  specific_date: {
     type: Date,
    default: Date.now,
  },
  specific_expiry_date: {
     type: Date,
    default: Date.now,
  },
  specific_quantity: {
    type: String,
    required: true,
  },
mrpPrice:{
  type: Number,
  required: true,
},
  price: {
    type: Number,
    required: true,
  },
  discount: {
    type: String,
  },

  codprepaid: {
    type: Number,
    default:0,
    required: true,
  },
  category:[{
    MainCategory:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
    },
    Subcategories:[{    
      Parent_Subcategory:{
        type: mongoose.Schema.Types.ObjectId,
         ref: "SubCategoryParent"
        },
        Child_Subcategory:[{
          type: mongoose.Schema.Types.ObjectId,
         ref: "SubCategoryChild"
        }]
      }]
  }],

  variants: [{

      main_varient:{
        type: String,
      },
      sub_variants:[{
      variantid:{
        type: String,
      },
      quantity_type:{
        type: String,
      },
    }]
   
    
  }],

  manufacturer: {
    type: String,
  },
  available: {
    type: Boolean,
   require:true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  recommendedProducts:[{
    code:{
 type:String

    },
   
    
  }]
  ,
  otherProducts:[{
    code:{
  type:String
    }
  }]
});

module.exports = mongoose.model("Product", productSchema);
