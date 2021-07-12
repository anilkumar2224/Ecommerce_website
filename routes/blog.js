const express = require("express");
const router = express.Router();
const Blog = require("../models/blog");
var moment = require("moment");

// GET: display all products
router.get("/", async (req, res) => {
  const successMsg = req.flash("success")[0];
  const errorMsg = req.flash("error")[0];
  const perPage = 6;
  let page = parseInt(req.query.page) || 1;
  try {
    const allblog = await Blog.find()
      .sort("-createdAt")
      .skip(perPage * page - perPage)
      .limit(perPage);

    const count = await Blog.count();

    res.render("shop/blog", {
      pageName: "Blogs",
      blog: allblog,
      successMsg,
      errorMsg,
      current: page,
      breadcrumbs: null,
      home: "/blog/?",
      pages: Math.ceil(count / perPage),
    });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

//GET: get a certain category by its slug

router.get("/:slug", async (req, res) => {
  const successMsg = req.flash("success")[0];
  const errorMsg = req.flash("error")[0];
  const perPage = 8;
  let page = parseInt(req.query.page) || 1;
  try {
    const allBlogs = await Blog.find({
      blog_category:
        req.params.slug.charAt(0).toUpperCase() + req.params.slug.slice(1),
    })
      .sort("-createdAt")
      .populate("category");

    res.render("shop/blog", {
      pageName:
        req.params.slug.charAt(0).toUpperCase() + req.params.slug.slice(1),
      blog: allBlogs,
      successMsg,
      errorMsg,
      current: page,
      home: "/blog/" + req.params.slug.toString() + "/?",
    });
  } catch (error) {
    console.log(error);
    return res.redirect("./");
  }
});

router.get("/:slug/:title", async (req, res) => {
  const successMsg = req.flash("success")[0];
  const errorMsg = req.flash("error")[0];
  let page = parseInt(req.query.page) || 1;
  try {
    const blog = await Blog.find({
      blog_category: req.params.slug,
      title: req.params.title,
    })
      .sort("-createdAt")
      .populate("category");

    res.render("shop/singleblog", {
      pageName:
        req.params.slug.charAt(0).toUpperCase() + req.params.slug.slice(1),
      blog: blog[0],
      successMsg,
      errorMsg,
      current: page,
      home: "/blog/" + req.params.slug.toString() + "/?",
    });
  } catch (error) {
    console.log(error);
    // return res.redirect("./");
  }
});
module.exports = router;
