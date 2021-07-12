const express = require("express");
const router = express.Router();
var request = require("request");
const ConsultMeet = require("../models/consultant");
const forgotpasswordmail = require("./forgotpasswordmail");
const authmail = require("./authmail")
const url = require("url");
const fetch = require("node-fetch");

const User = require ("../models/user")
const csrf = require("csurf");
var passport = require("passport");
const Order = require("../models/order");
const Cart = require("../models/cart");
const middleware = require("../middleware");
const {
  userSignUpValidationRules,
  userSignInValidationRules,
  validateSignup,
  validateSignin,
} = require("../config/validator");
const csrfProtection = csrf();
router.use(csrfProtection);

// GET: display the signup form with csrf token
router.get("/signup", middleware.isNotLoggedIn, (req, res) => {
  req.session.mailsend=false;
  console.log(req.session)
  var errorMsg = req.flash("error")[0];
  res.render("user/signuppage", {
    csrfToken: req.csrfToken(),
    errorMsg,
    pageName: "Sign Up",
  });
});
// POST: handle the signup logic
router.post(
  "/signup",
  [
    middleware.isNotLoggedIn,
    userSignUpValidationRules(),
    validateSignup,
    passport.authenticate("local.signup", {
      successRedirect: "/user/profile",
      failureRedirect: "/user/signup",
      failureFlash: true,
    }),
  ],
  async (req, res) => {
    try {
      req.flash("success","Account created Successfully")
      //if there is cart session, save it to the user's cart in db
      if (req.session.cart) {
        const cart = await new Cart(req.session.cart);
        cart.user = req.user._id;
        await cart.save();
      }
      // redirect to the previous URL
      if (req.session.oldUrl) {
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
      } else {
        res.redirect("/");
      }
    } catch (err) {
      console.log(err);
      req.flash("error", err.message);
      return res.redirect("/");
    }
  }
);

// GET: display the signin form with csrf token
router.get("/signin", middleware.isNotLoggedIn, async (req, res) => {
  var errorMsg = req.flash("error")[0];
  const successMsg = req.flash("success")[0];

  res.render("user/loginpage", {
    csrfToken: req.csrfToken(),
    errorMsg,
    successMsg,
    pageName: "Sign In",
  });
});

// POST: handle the signin logic
router.post(
  "/signin",
  [
    middleware.isNotLoggedIn,
    userSignInValidationRules(),
    validateSignin,
    passport.authenticate("local.signin", {
      failureRedirect: "/user/signin",
      failureFlash: true,
    }),
  ],
  async (req, res) => {
    try {
      // cart logic when the user logs in
      let cart = await Cart.findOne({ user: req.user._id });
      // if there is a cart session and user has no cart, save it to the user's cart in db
      if (req.session.cart && !cart) {
        const cart = await new Cart(req.session.cart);
        cart.user = req.user._id;
        await cart.save();
      }
      // if user has a cart in db, load it to session
      if (cart) {
        req.session.cart = cart;
      }
      // redirect to old URL before signing in
      if (req.session.oldUrl) {
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
      } else {
        res.redirect("/");
      }
    } catch (err) {
      console.log(err);
      req.flash("error", err.message);
      return res.redirect("/");
    }
  }
);

// GET: display user's profile
router.get("/profile", middleware.isLoggedIn, async (req, res) => {
  const successMsg = req.flash("success")[0];
  const errorMsg = req.flash("error")[0];
  try {
    // find all orders of this user
    let allOrders = await Order.find({ user: req.user }).populate(
      "cart.items.productId"
    );
    allOrders= allOrders.reverse();
    console.log("hi usee",req.user);
    let allConsultmeets = await ConsultMeet.find({ user: req.user});
    console.log("hi useecamsp",allConsultmeets);

    res.render("user/userprofile", {
      orders: allOrders,
      meets: allConsultmeets,
      errorMsg,
      successMsg,
      csrfToken: req.csrfToken(),
      pageName: "User Profile",
    });
  } catch (err) {
    console.log(err);
    return res.redirect("/");
  }
});
router.post("/fpform",async (req,res)=>{
const user = await User.find({email: req.body.email})
  if(user.length>0){
  console.log(user,"hi ")
  const maildata = {
    user:user[0],
  };
  forgotpasswordmail(maildata);
  res.render("user/fp")
  }else{
    req.flash("error","User Doesnot Exist")
  res.redirect(req.headers.referer);

  }
})
router.get("/forgotpassword",(req,res)=>{
  var errorMsg = req.flash("error")[0];
 
  res.render("user/fpemailform",{
    csrfToken :  req.csrfToken(),
    errorMsg,
  })
})

router.post("/authform",[
  middleware.isNotLoggedIn,
  userSignUpValidationRules(),
  validateSignup, 
  
],async (req,res)=>{
  // let resendcheck = req.body.resendcheck;
  // req.session.resendcheck ="1";
  var username = req.body.name;
  var email = req.body.email;
  var password = req.body.password;
  var password2 = req.body.password2;
  const user = await User.find({email: req.body.email})
  if(user.length>0){
    req.flash("error","User Already exists")
    res.redirect(req.headers.referer);
  }else{

    // if(resendcheck=="2"){
    //   req.session.mailsend=false;
    //   resendcheck="0"

    // }
    if(!req.session.mailsend){
      var num = Math.floor(Math.random() * 90000) + 10000;
      const maildata = {
        num,
        email ,
        username,
      };
      authmail(maildata);
      req.session.mailsend=true;
      req.session.num=num;
    }
    console.log(req.session,"hi")
  // console.log(req.session,"mowaa")
if(req.body.password != req.body.password2){
  req.flash("error", "PAsswords doesn't match")
 res.redirect(req.headers.referer);
  
 }else{
  
  res.render("user/authotp",{
    num:req.session.num,
    csrfToken:  req.csrfToken(),
    username,
    email,
    password,
    password2,
   })

 

}
}
})
router.post("/otpcheck",(req,res)=>{
  if(req.body.otp==req.session.num){
    res.send({status:true})
  }else{
    res.send({status:false})
  }
})
router.post("/resendcheck",(req,res)=>{
      req.session.mailsend=false;
       res.send({status:true})
})
router.get("/trackorder", (req, res) => {
  const trackid = req.query.id;
  const cost = req.query.amount;
  var options = {
    method: "GET",
    url:
      "https://apiv2.shiprocket.in/v1/external/courier/track?order_id=" +
      trackid,
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjEzMzMzNzYsImlzcyI6Imh0dHBzOi8vYXBpdjIuc2hpcHJvY2tldC5pbi92MS9leHRlcm5hbC9hdXRoL2xvZ2luIiwiaWF0IjoxNjIxODQxMjY1LCJleHAiOjE2MjI3MDUyNjUsIm5iZiI6MTYyMTg0MTI2NSwianRpIjoiR0hDZ1k2SmNMYjB5QVM3UCJ9.TyqyYcbrdiLgCcQX0iDWsPq_Piy50ps5FMpbKsehQ2Y",
    },
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    const trackresponse = response.body;
    console.log(trackresponse);
  });
  res.render("user/trackorder", {
    trackid,
    cost,
    csrfToken: req.csrfToken(),
    // trackresponse,
  });
});
router.get("/resetpassword/:id",async(req,res)=>{
  var errorMsg = req.flash("error")[0];

   res.render("user/fpresetform",{
     id:req.params.id,
     csrfToken: req.csrfToken(),
     errorMsg
   })
})
router.post("/resetpassword",async(req,res)=>{
  if(req.body.password != req.body.password2){
   req.flash("error", "PAsswords doesn't match")
  res.redirect(req.headers.referer);
   
  }else{
    const user = await User.findOne({ _id: req.body.id });
user.password=  user.encryptPassword(req.body.password);
await user.save().then(data=>{

  console.log(data)
  req.flash("success","Password Changed Successfully")
}).catch(err=>{
  console.log(err)
  res.redirect("/user/singup")
})
return res.redirect("/user/profile")
  
  }

})
// GET: logout
router.get("/logout", middleware.isLoggedIn, (req, res) => {
  req.logout();
  req.session.cart = null;
  res.redirect("/user/signin");
});
module.exports = router;
