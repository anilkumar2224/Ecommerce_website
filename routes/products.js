const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const Category = require("../models/category");
const Subcategory = require("../models/subcategory");
const Subcategory_child = require("../models/childcat");
var moment = require("moment");
const Review = require("../models/reviews");
const csrf = require("csurf");
const { database } = require("faker");
const csrfProtection = csrf();
router.use(csrfProtection);










// GET: display all products
router.get("/", async (req, res) => {
  const successMsg = req.flash("success")[0];
  const errorMsg = req.flash("error")[0];
  const perPage = 20;
  let page = parseInt(req.query.page) || 1;
  try {
    const products = await Product.find({})
      .sort("-createdAt")
      .populate("category.MainCategory")
      .populate("category.Subcategories.Parent_Subcategory")
      .populate("category.Subcategories.Child_Subcategory");

    const count = await Product.count();

    res.render("shop/index", {
      pageName: "All Products",
      products,
      successMsg,
      errorMsg,
      current: page,
      breadcrumbs: null,
      home: "/products/?",
      pages: Math.ceil(count / perPage),
    });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

// GET: search box
router.get("/search", async (req, res) => {
  const perPage = 8;
  let page = parseInt(req.query.page) || 1;
  const successMsg = req.flash("success")[0];
  const errorMsg = req.flash("error")[0];

  try {
    const products = await Product.find({
      title: { $regex: req.query.search, $options: "i" },
    })
      .sort("-createdAt")
      .populate("category")
      .exec();
    const count = await Product.count({
      title: { $regex: req.query.search, $options: "i" },
    });
    res.render("shop/page4", {
      pageName: "Search Results",
      products,
      successMsg,
      errorMsg,
      current: page,
      breadcrumbs: null,
      home: "/products/search?search=" + req.query.search + "&",
      pages: Math.ceil(count / perPage),
    });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

//GET: get a certain category by its slug (this is used for the categories navbar)
router.get("/category/:slug", async (req, res) => {
  const successMsg = req.flash("success")[0];
  const errorMsg = req.flash("error")[0];
  const perPage = 8;
  let page = parseInt(req.query.page) || 1;
  try {
    const foundCategory = await Category.findOne({ slug: req.params.slug })
      .populate("Subcategories.Parent_Subcategory")
      .populate("Subcategories.Child_Subcategory");
    const sub = foundCategory;
    // console.log(sub);
  
    // console.log(foundCategory);
    const maincatId = foundCategory._id;
    // .skip(perPage * page - perPage)
    //   .limit(perPage)
    const allProducts = await Product.find({
      "category.MainCategory": maincatId,
    })
      .sort("-createdAt")
      .populate("category.MainCategory")
      .populate("category.Subcategories.Parent_Subcategory")
      .populate("category.Subcategories.Child_Subcategory");


    const count = await Product.count({ "category.MainCategory": maincatId });
    // console.log(allProducts);
    res.render("shop/page1", {
      pageName: foundCategory.title,
      pageNameslug: foundCategory.slug,
      currentCategory: foundCategory,
      products: allProducts,
      successMsg,
      errorMsg,
      current: page,
      breadcrumbs: req.breadcrumbs,
      home: "/products/" + req.params.slug.toString() + "/?",
      pages: Math.ceil(count / perPage),
    });
  } catch (error) {
    console.log(error);
    return res.redirect("/");
  }
});

// GET: display Parent sub category products by its slug
router.get("/category/:slug/:parentslug", async (req, res) => {
  const successMsg = req.flash("success")[0];
  const errorMsg = req.flash("error")[0];
  const perPage = 8;
  let page = parseInt(req.query.page) || 1;
  try {
    const foundCategory = await Category.findOne({ slug: req.params.slug })
      .populate("Subcategories.Parent_Subcategory")
      .populate("Subcategories.Child_Subcategory");
    // console.log(foundCategory);
    let data = [];
    foundCategory.Subcategories.forEach((element) => {
      if (req.params.parentslug === element.Parent_Subcategory.slug) {
        data = element;
      }
    });

    const parentCategory = await Subcategory.findOne({
      slug: req.params.parentslug,
    });
    // console.log("here", parentCategory);
    const allProducts = await Product.find({
      "category.MainCategory": foundCategory._id,
      "category.Subcategories.Parent_Subcategory": parentCategory._id,
    })
      .sort("-createdAt")
      .populate("category.MainCategory")
      .populate("category.Subcategories.Parent_Subcategory")
      .populate("category.Subcategories.Child_Subcategory");

    const count = await Product.count({
      "category.MainCategory": foundCategory._id,
      "category.Subcategories.Parent_Subcategory": parentCategory._id,
    });
    // console.log(allProducts);
    res.render("shop/page5", {
      title: foundCategory.title,
      titleslug: foundCategory.slug,
      pageName: data.Parent_Subcategory.title,
      pageNameslug: data.Parent_Subcategory.slug,
      currentCategory: data,
      products: allProducts,
      successMsg,
      errorMsg,
      current: page,
      breadcrumbs: req.breadcrumbs,
      home: "/products/" + req.params.slug.toString() + "/?",
      pages: Math.ceil(count / perPage),
      text: req.params.sub,
    });
  } catch (error) {
    console.log(error);
    return res.redirect("/");
  }
});
// GET: display Child sub category products by its slug
router.get("/category/:slug/:parentslug/:childslug", async (req, res) => {
  const successMsg = req.flash("success")[0];
  const errorMsg = req.flash("error")[0];
  const perPage = 8;
  let page = parseInt(req.query.page) || 1;
  try {
    const foundCategory = await Category.findOne({ slug: req.params.slug });
    const parentCategory = await Subcategory.findOne({
      slug: req.params.parentslug,
    });
    const childCategory = await Subcategory_child.findOne({
      slug: req.params.childslug,
    });
    const allProducts = await Product.find({
      "category.MainCategory": foundCategory._id,
      "category.Subcategories.Parent_Subcategory": parentCategory._id,
      "category.Subcategories.Child_Subcategory": childCategory._id,
    })
      .sort("-createdAt")
      .populate("category.MainCategory")
      .populate("category.Subcategories.Parent_Subcategory")
      .populate("category.Subcategories.Child_Subcategory");

    const count = await Product.count({
      "category.MainCategory": foundCategory._id,
      "category.Subcategories.Parent_Subcategory": parentCategory._id,
      "category.Subcategories.Child_Subcategory": childCategory._id,
    });
    // console.log(allProducts);
    res.render("shop/page2", {
      title: foundCategory.title,
      titleslug: foundCategory.slug,
      title1: parentCategory.title,
      title1slug: parentCategory.slug,
      pageName: req.params.childslug,
      products: allProducts,
      successMsg,
      errorMsg,
      current: page,
      breadcrumbs: req.breadcrumbs,
      home: "/products/" + req.params.slug.toString() + "/?",
      pages: Math.ceil(count / perPage),
      text: req.params.sub,
    });
  } catch (error) {
    console.log(error);
    return res.redirect("/");
  }
});

// GET: display a certain product by its id
router.get("/:id", async (req, res) => {
  const successMsg = req.flash("success")[0];
  const errorMsg = req.flash("error")[0];
  // console.log(req.query);
  try {
    const product = await Product.findById(req.params.id)
      .populate("category.MainCategory")
      .populate("category.Subcategories.Parent_Subcategory")
      .populate("category.Subcategories.Child_Subcategory");
    const products = await Product.find({});
    const product_reviews = await Review.findOne({ productId: req.params.id });
    let recomids = product.recommendedProducts.map(e=>{
      return e.code;
    });
   
    let recommends = await Product.find()
      .where("productCode")
      .in(recomids)
      .exec();
    // console.log(recomids);
    let data = [];
    if (product_reviews) {
      data = product_reviews.reviews;
    }
  
    let otherids = product.otherProducts.map(e=>{
      return e.code;
    });
   
    let others = await Product.find()
      .where("productCode")
      .in(otherids)
      .exec();
    // console.log(recomids);
    
  //  let variants =  await Product.find()
  //  .where("productCode")
  //  .in(variantids)
  //  .exec();
    res.render("shop/single", {
      pageName: product.title,
      product,
      successMsg,
      errorMsg,
      moment: moment,
      csrfToken: req.csrfToken(),
      reviews: data,
      recommends,
      others,
    });
  } catch (error) {
    console.log(error);
    return res.redirect("/");
  }
});

module.exports = router;
