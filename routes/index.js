const express = require("express");
const csrf = require("csurf");
const url = require("url");
const Product = require("../models/product");
const Coupon = require("../models/couponcode")
const Shippingcharge = require("../models/shippingcharges");
const cryptoJs = require("crypto-js");
const jssha = require("jssha");
const Category = require("../models/category");
const Cart = require("../models/cart");
const Homepage = require("../models/homepage");
const Freeconsult_endDate = require("../models/freeconsult");

const Order = require("../models/order");
const Consultant = require("../models/consultant");
const middleware = require("../middleware");
const { request } = require("../app");
const fetch = require("node-fetch");
const sendmail = require("./sendmail");
const cart = require("../models/cart");

const router = express.Router();
const csrfProtection = csrf();
//ordershipment , success and fail post requests are placed above csrf middleware because payu money cant return csrf token
// router.post("/ordershipment", async (req, res) => {
//   await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
//     method: "POST",
//     body: JSON.stringify(res.req.body),
//     headers: {
//       "Content-Type": "application/json",
//       Authorization:
//         "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjE0NjEzMDksImlzcyI6Imh0dHBzOi8vYXBpdjIuc2hpcHJvY2tldC5pbi92MS9leHRlcm5hbC9hdXRoL2xvZ2luIiwiaWF0IjoxNjI0MDM5NzI3LCJleHAiOjE2MjQ5MDM3MjcsIm5iZiI6MTYyNDAzOTcyNywianRpIjoiVWVyZ2EweTVqTVNNVzljbyJ9.Hgi_15Y-ByNY09by-dLYEBKCYlG-yvY3xI7qCYoO7Dc",
//     },
//   })
//     .then((res) => res.json())
//     .then((json) => console.log(json))
//     .catch((err) => {
//       console.log(err);
//     });
// });
// successful purchase route
router.post("/success", async(req, res) => {

  
  var productsarr = res.req.body.productinfo.split(",");
  var qtyarr = res.req.body.udf2.split(",");
  var costarr = res.req.body.udf3.split(",");
  var belongings = [];
  for (var i = 0; i < qtyarr.length; i++) {
    var data1 = {
      name: productsarr[i],
      sku: "no" + i + qtyarr[i],
      units: qtyarr[i],
      selling_price: costarr[i],
      discount: "",
      tax: "",
      hsn: 441122,
    };
    belongings[i] = data1;
    data1 = {};
  }
  const data = JSON.stringify({
    order_id: res.req.body.payuMoneyId,
    order_date: res.req.body.addedon,
    pickup_location: "Hansi",
    channel_id: "",
    comment: "BRUH",
    billing_customer_name: res.req.body.firstname,
    billing_last_name: "BRUH",
    billing_address: res.req.body.udf1,
    billing_address_2: "",
    billing_city: res.req.body.city,
    billing_pincode: res.req.body.zipcode,
    billing_state: res.req.body.address1,
    billing_country: res.req.body.country,
    billing_email: res.req.body.email,
    billing_phone: res.req.body.phone,
    shipping_is_billing: true,
    shipping_customer_name: "",
    shipping_last_name: "",
    shipping_address: "",
    shipping_address_2: "",
    shipping_city: "",
    shipping_pincode: "",
    shipping_country: "",
    shipping_state: "",
    shipping_email: "",
    shipping_phone: "",
    order_items: belongings,
    payment_method: "Prepaid",
    shipping_charges: 0,
    giftwrap_charges: 0,
    transaction_charges: 0,
    total_discount: 0,
    sub_total: res.req.body.amount,
    length: 10,
    breadth: 10,
    height: 15,
    weight: 0.5,
  });
  const datatoken = JSON.stringify({
    email:process.env.SHIPROCKET_AUTH_EMAIL,
    password:process.env.SHIPROCKET_AUTH_PASSWORD,
   })
   var authtoken = null;
   await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
     method: "POST",
     body: datatoken,
     headers: {
       "Content-Type": "application/json",
       },
   })
     .then((res) => res.json())
     .then((json) => {
       authtoken = json.token;
     })
     .catch((err) => {
       console.log(err);
     });
  await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
    method: "POST",
    body:data,
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Bearer "+authtoken,
    },
  })
    .then((res) => res.json())
    .then((json) => console.log(json))
    .catch((err) => {
      console.log(err);
    });
  // req.flash("success", "Successfully purchased");

  res.redirect(
    url.format({
      pathname: "/success",
      query: {
        status: res.req.body.status,
        paymentId: res.req.body.payuMoneyId,
        address: res.req.body.udf1,
      },
    })
  );
});
// failed payments
router.post("/fail", (req, res) => {
  res.redirect(
    url.format({
      pathname: "/fail",
      query: {
        status: res.req.body.status,
      },
    })
  );
});

router.post("/codprepaidsuccess", async(req, res) => {

  
  var productsarr = res.req.body.productinfo.split(",");
  var qtyarr = res.req.body.udf2.split(",");
  var costarr = res.req.body.udf3.split(",");
  var belongings = [];
  for (var i = 0; i < qtyarr.length; i++) {
    var data1 = {
      name: productsarr[i],
      sku: "no" + i + qtyarr[i],
      units: qtyarr[i],
      selling_price: costarr[i],
      discount: "",
      tax: "",
      hsn: 441122,
    };
    belongings[i] = data1;
    data1 = {};
  }
  console.log(res.req.body)
  const data = JSON.stringify({
    order_id: res.req.body.payuMoneyId,
    order_date: res.req.body.addedon,
    pickup_location: "Hansi",
    channel_id: "",
    comment: "BRUH",
    billing_customer_name: res.req.body.firstname,
    billing_last_name: "BRUH",
    billing_address: res.req.body.udf1,
    billing_address_2: "",
    billing_city: res.req.body.city,
    billing_pincode: res.req.body.zipcode,
    billing_state: res.req.body.address1,
    billing_country: res.req.body.country,
    billing_email: res.req.body.email,
    billing_phone: res.req.body.phone,
    shipping_is_billing: true,
    shipping_customer_name: "",
    shipping_last_name: "",
    shipping_address: "",
    shipping_address_2: "",
    shipping_city: "",
    shipping_pincode: "",
    shipping_country: "",
    shipping_state: "",
    shipping_email: "",
    shipping_phone: "",
    order_items: belongings,
    payment_method: "COD",
    shipping_charges: 0,
    giftwrap_charges: 0,
    transaction_charges: 0,
    total_discount: 0,
    sub_total: res.req.body.udf4,
    length: 10,
    breadth: 10,
    height: 15,
    weight: 0.5,
  
  });
  // console.log("anil-lavda",res.req.body)
  const datatoken = JSON.stringify({
    email:process.env.SHIPROCKET_AUTH_EMAIL,
    password:process.env.SHIPROCKET_AUTH_PASSWORD,
   })
   var authtoken = null;
   await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
     method: "POST",
     body: datatoken,
     headers: {
       "Content-Type": "application/json",
       },
   })
     .then((res) => res.json())
     .then((json) => {
       authtoken = json.token;
     })
     .catch((err) => {
       console.log(err);
     });
  await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Bearer "+authtoken
    },})
    .then((res) => res.json())
    .then((json) => console.log(json))
    .catch((err) => {
      console.log(err);
    }
  );
  res.redirect(
    url.format({
      pathname: "/codprepaidsuccess",
      query: {
        status: res.req.body.status,
        paymentId: res.req.body.payuMoneyId,
        address: res.req.body.udf1,
      },
    })
  );
});
router.post("/codprepaidfail", (req, res) => {
  res.redirect(
    url.format({
      pathname: "/fail",
      query: {
        status: res.req.body.status,
      },
    })
  );
});
// failed consultants post route
router.post("/consultfail", (req, res) => {
  res.redirect(
    url.format({
      pathname: "/consultfail",
      query: {
        status: res.req.body.status,
      },
    })
  );
});
// post route of success consultants
router.post("/consultsuccess", (req, res) => {
  res.redirect(
    url.format({
      pathname: "/consultsuccess",
      query: {
        status: res.req.body.status,
        email: res.req.body.email,
        name: res.req.body.firstname,
        number: res.req.body.phone,
        timeslot: res.req.body.udf1,
        ptype: res.req.body.udf2,

        // address: res.req.body.udf1,
      },
    })
  );
});
router.post("/postdata", async (req, res) => {
  if (req.body.ids === "") {
    res.render("shop/wish", {
      pageName: "Wish List",
      products: [],
    });
  } else {
    const productIds = req.body.ids.split(",");
    var products = await Product.find().where("_id").in(productIds).exec();

    res.render("shop/wish", {
      pageName: "Wish List",
      products,
    });
    res.end();
  }
});
// sending data to ship rocket for COD deliveries
// router.post("/ordershipment", async (req, res) => {
//   await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
//     method: "POST",
//     body: JSON.stringify(res.req.body),
//     headers: {
//       "Content-Type": "application/json",
//       Authorization:
//         "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjE0NjEzMDksImlzcyI6Imh0dHBzOi8vYXBpdjIuc2hpcHJvY2tldC5pbi92MS9leHRlcm5hbC9hdXRoL2xvZ2luIiwiaWF0IjoxNjI0MDM5NzI3LCJleHAiOjE2MjQ5MDM3MjcsIm5iZiI6MTYyNDAzOTcyNywianRpIjoiVWVyZ2EweTVqTVNNVzljbyJ9.Hgi_15Y-ByNY09by-dLYEBKCYlG-yvY3xI7qCYoO7Dc",
//     },
//   })
//     .then((res) => res.json())
//     .then((json) => console.log(json))
//     .catch((err) => {
//       console.log(err);
//     });
// });
// success route for COD buyers
router.post("/codsuccess",async (req, res) => {
  var productsarr = res.req.body.productinfo.split(",");
  var qtyarr = res.req.body.udf2.split(",");
  var costarr = res.req.body.udf3.split(",");
  var belongings = [];
  for (var i = 0; i < qtyarr.length; i++) {
    var data1 = {
      name: productsarr[i],
      sku: "no" + i + qtyarr[i],
      units: qtyarr[i],
      selling_price: costarr[i],
      discount: "",
      tax: "",
      hsn: 441122,
    };
    belongings[i] = data1;
    data1 = {};
  }
  function genTxnid() {
    const d = new Date();
    let gentxnid = cryptoJs.SHA256(
      Math.floor(Math.random() * 10 + 1).toString() + d.getTime().toString()
    );
    return "v" + gentxnid.toString().substr(0, 18);
  }
  var txnid = genTxnid();
  const data = JSON.stringify({
    order_id: txnid,
    order_date: new Date(),
    pickup_location: "Hansi",
    channel_id: "",
    comment: "BRUH",
    billing_customer_name: req.body.firstname,
    billing_last_name: "BRUH",
    billing_address: req.body.udf1,
    billing_address_2: "",
    billing_city: req.body.city,
    billing_pincode: req.body.zipcode,
    billing_state: req.body.address1,
    billing_country: "India",
    billing_email: req.body.email,
    billing_phone: req.body.phone,
    shipping_is_billing: true,
    shipping_customer_name: "",
    shipping_last_name: "",
    shipping_address: "",
    shipping_address_2: "",
    shipping_city: "",
    shipping_pincode: "",
    shipping_country: "",
    shipping_state: "",
    shipping_email: "",
    shipping_phone: "",
    order_items: belongings,
    payment_method: "COD",
    shipping_charges: 0,
    giftwrap_charges: 0,
    transaction_charges: 0,
    total_discount: 0,
    sub_total: req.body.amount,
    length: 10,
    breadth: 10,
    height: 15,
    weight: 0.5,
  });
  console.log(data,"cod")
  const datatoken = JSON.stringify({
   email:process.env.SHIPROCKET_AUTH_EMAIL,
   password:process.env.SHIPROCKET_AUTH_PASSWORD,
  })
  var authtoken = null;
  await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
    method: "POST",
    body: datatoken,
    headers: {
      "Content-Type": "application/json",
      },
  })
    .then((res) => res.json())
    .then((json) => {
      authtoken = json.token;
    })
    .catch((err) => {
      console.log(err);
    });
  await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Bearer "+authtoken
    },
  })
    .then((res) => res.json())
    .then((json) => console.log(json))
    .catch((err) => {
      console.log(err);
    });
  // req.flash("success", "Successfully purchased");

  res.redirect(
    url.format({
      pathname: "/codsuccess",
      query: {
        paymentId: txnid,
        address: req.body.udf1 + req.body.city + req.body.udf4 + req.body.zip,
      },
    })
  );
});
// failure route for COD buyers
router.post("/codfail", (req, res) => {
  res.redirect(
    url.format({
      pathname: "/codfail",
      query: {
        status: "Order Not accepted",
      },
    })
  );
});
router.post('/checkcoupon',async(req,res)=>{
  console.log("hiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii")
  let pricedrop=0;
  let total=0;
  let charge=parseInt(req.body.charge);
  const coupons=await Coupon.find({});
  var cart = await Cart.findById(req.session.cart._id)
  if(req.body!=null &&Object.entries(req.body).length !== 0){
  if(req.query.couponcode!=null ||req.body.couponcode!=undefined ){
    for(item of coupons){
      if(item.coupon==req.body.couponcode && item.minamount<req.body.totalCost){
        // &&cart.coupon!=req.body.couponcode
        cart.coupon=req.body.couponcode;
        cart.pricedrop=item.pricedrop;
        cart.discountAmount=req.body.totalCost-item.pricedrop+charge;
        pricedrop=item.pricedrop;
        total=req.body.totalCost-pricedrop+charge;
        console.log(total,"HI")
        await cart.save();
      }
    }
  }
  
}
let data={
  total,
  pricedrop
}
res.send(data);
})
router.use(csrfProtection);


// GET: home page
router.get("/", async (req, res) => {

  
  try {
    // console.log(req.session);
    // console.log("before", req.session.cart);
    if (req.query.statuscheck == "true") {
      req.session.cart = null;
      req.flash("success", "Order created successfully");

      // req.flash("success", "Successfully purchased");

     return res.redirect("/user/profile");
    }

    const homepagedata = await Homepage.findOne({});


    let bannerImages =homepagedata.bannerImages.reverse();
    let newArrivals = await Product.find()
      .where("productCode")
      .in(homepagedata.newArrivals)
      .exec();
      newArrivals=newArrivals.reverse();
// console.log(homepagedata,newArrivals)
    let bestInBruh = await Product.find()
      .where("productCode")
      .in(homepagedata.bestInBruh)
      .exec();
      bestInBruh= bestInBruh.reverse();
    let trending = await Product.find()
      .where("productCode")
      .in(homepagedata.trending)
      .exec();
      trending=trending.reverse();
    let youMayLike = await Product.find()
      .where("productCode")
      .in(homepagedata.youMayLike)
      .exec();
      youMayLike=youMayLike.reverse();
   
    // const products = await Product.find({})
    //   .sort("-createdAt")
    //   .populate("category.MainCategory");
    res.render("shop/homebody", {
      pageName: "Home",
      bannerImages,
      newArrivals,
      bestInBruh,
      trending,
      youMayLike,
      // csrfToken: req.csrfToken,
    });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

// GET: add a product to the shopping cart when "Add to cart" button is pressed

router.get("/add-to-cart/:id", async (req, res) => {
  const productId = req.params.id;
 
  try {
    // get the correct cart, either from the db, session, or an empty cart.
    let user_cart;
    if (req.user) {
      user_cart = await Cart.findOne({ user: req.user._id });
    }
    let cart;
    if (
      (req.user && !user_cart && req.session.cart) ||
      (!req.user && req.session.cart)
    ) {
      cart = await new Cart(req.session.cart);
    } else if (!req.user || !user_cart) {
      cart = new Cart({});
    } else {
      cart = user_cart;
    }

    // add the product to the cart
    const product = await Product.findById(productId);
    const itemIndex = cart.items.findIndex((p) => p.productId == productId);
    if (itemIndex > -1) {
      // if product exists in the cart, update the quantity
  
      cart.items[itemIndex].qty++;
      cart.items[itemIndex].price = cart.items[itemIndex].qty * product.price;
      cart.totalQty++;
      cart.totalCost += product.price;
      cart.items[itemIndex].codprepaid = cart.items[itemIndex].qty * product.codprepaid;
      cart.totalcodprepaid += product.codprepaid;
      cart.discountAmount += cart.totalCost 

     
    } else {
      // if product does not exists in cart, find it in the db to retrieve its price and add new item
      cart.items.push({
        productId: productId,
        qty: 1,
        price: product.price,
        codprepaid: product.codprepaid,
        title: product.title,
        productCode: product.productCode,
      });
      cart.totalQty++;
      cart.totalCost += product.price;
      cart.totalcodprepaid += product.codprepaid;
      cart.discountAmount += cart.totalCost 

    }

    // if the user is logged in, store the user's id and save cart to the db
    if (req.user) {
      cart.user = req.user._id;
      await cart.save();
    }
    req.session.cart = cart;
    res.send({
      data: cart,
      products: await productsFromCart(req.session.cart),
    });
  } catch (err) {
    console.log(err.message);
    res.redirect("/");
  }
});

router.get("/increase/:id", async (req, res) => {
  const productId = req.params.id;
  try {
    // get the correct cart, either from the db, session, or an empty cart.
    let user_cart;
    if (req.user) {
      user_cart = await Cart.findOne({ user: req.user._id });
    }
    let cart;
    if (
      (req.user && !user_cart && req.session.cart) ||
      (!req.user && req.session.cart)
    ) {
      cart = await new Cart(req.session.cart);
    } else if (!req.user || !user_cart) {
      cart = new Cart({});
    } else {
      cart = user_cart;
    }
// console.log(req.query.qty +"from here");
    // add the product to the cart
    const product = await Product.findById(productId);
    const itemIndex = cart.items.findIndex((p) => p.productId == productId);
    if (itemIndex > -1) {

      // if product exists in the cart, update the quantity
      if( req.query!=null && req.query!=undefined && Object.entries(req.query).length !== 0 ){
        
        if(req.query.qty!=null || req.query.qty!=undefined || req.query.qty!='0'){

          cart.items[itemIndex].qty+=parseInt(req.query.qty);
          cart.items[itemIndex].price = cart.items[itemIndex].qty * product.price;
          cart.items[itemIndex].codprepaid = cart.items[itemIndex].qty * product.codprepaid;
          cart.totalQty+=parseInt(req.query.qty);
          cart.totalCost += product.price*parseInt(req.query.qty);
          cart.totalcodprepaid += product.codprepaid*parseInt(req.query.qty);
      cart.discountAmount += cart.totalCost 

        }
      }else{

        cart.items[itemIndex].qty++;
        cart.items[itemIndex].price = cart.items[itemIndex].qty * product.price;
        cart.items[itemIndex].codprepaid = cart.items[itemIndex].qty * product.codprepaid;
        cart.totalQty++;
        cart.totalCost += product.price;
        cart.totalcodprepaid += product.codprepaid;
      cart.discountAmount += cart.totalCost 

      }
      console.log(cart,"cart")
    } else {
      // if product does not exists in cart, find it in the db to retrieve its price and add new item
      cart.items.push({
        productId: productId,
        qty: 1,
        price: product.price,
        codprepaid: product.codprepaid,
        title: product.title,
        productCode: product.productCode,
      });
      cart.totalQty++;
      cart.totalCost += product.price;
      cart.totalcodprepaid += product.codprepaid;
      cart.discountAmount += cart.totalCost 

    }

    // if the user is logged in, store the user's id and save cart to the db
    if (req.user) {
      cart.user = req.user._id;
      await cart.save();
    }
    req.session.cart = cart;
    req.flash("success", "Item added to the shopping cart");
    res.redirect(req.headers.referer);
    // res.send("cartsize" + cart.totalQty);
    // res.sendStatus(cart.totalQty);
  } catch (err) {
    console.log(err.message);
    res.redirect("/");
  }
});
//add reviews
router.post("/review", async (req, res) => {
  const productId = req.body.id;
  var product_reviews={};
  try {
    var check = 0;
    // get the correct cart, either from the db, session, or an empty cart.
    if (req.user) {
      const orders = await Order.find({ user: req.user._id });
      if( orders.cart!=undefined){
      orders.cart.items.forEach(async (element) => {
        if (element.productId === productId && orders.Delivered) {
          product_reviews = await Review.findOne({ productId: productId });
          check = 1;
        }
      });
    }
    } else {
      return res.redirect("/user/signin");
    }

    if (check == 0) {
      return res.send({ data: null });
    }
    let review;
    if (!product_reviews) {
      review = new Review({
        reviews: [],
        productId: productId,
      });
    } else {
      review = product_reviews;
    }

    // adding review
    review.reviews.push({
      name: req.user.username,
      rating: req.body.rating,
      comment: req.body.review,
      user: req.user._id,
    });

    // if the user is logged in, store the user's id and save review to the db
    if (req.user) {
      await review.save();
    }

    req.flash("success", "Item added to the shopping cart");
    // res.redirect(req.headers.referer);
    // res.send("cartsize"+cart.totalQty);
    // res.sendStatus(cart.totalQty)
    const data = review.reviews[review.reviews.length - 1];
    res.send({ reviews: data, name: req.user.username });
  } catch (err) {
    console.log(err.message);
    // res.redirect("/");
    res.send("bye");
  }
});

// GET: view shopping cart contents
router.get("/shopping-cart", async (req, res) => {
  try {
  var errorMsg = req.flash("error")[0];
// console.log(req.flash);
var status=true;
let pricedrop=0;

    // find the cart, whether in session or in db based on the user state
    let cart_user;
    if (req.user) {
      cart_user = await Cart.findOne({ user: req.user._id });
    }
    if (req.user && cart_user == null) {
      req.session.cart = null;
    }


//coupon code details


const shippingcharge=await Shippingcharge.find({});
console.log(shippingcharge);
var charge=0;


console.log(req.query);

    // if user is signed in and has cart, load user's cart from the db
    if (req.user && cart_user != null) {
      req.session.cart = cart_user;
      // res.send("hi");
      cart_user.coupon=null;
      cart_user.pricedrop=0;
      cart_user.discountAmount=cart_user.totalCost;
      console.log(cart_user,"ihfnewdjbn")
      await cart_user.save()
      let products=await productsFromCart(cart_user);
      for(item of products){
        if(!item.available){
           status=false;
             break;   
        }
      }
  
      for(shippingcharges of shippingcharge){
        if(cart_user.totalCost<shippingcharges.cartsize){
           charge=shippingcharges.shipping_charge;
           break;
        }
      }
      return res.render("shop/shopping-cart", {
        cart: cart_user,
        csrfToken:req.csrfToken(),
        pageName: "Shopping Cart",
        errorMsg,
        products,
        charge,
        status,
        pricedrop,
        total:charge+cart_user.totalCost-pricedrop
      });
    }

    // if there is no cart in session and user is not logged in, cart is empty
    if (req.session.cart == null) {
      // console.log("from req session", req.session.cart);
      return res.render("shop/shopping-cart", {
        cart: null,
        csrfToken:req.csrfToken(),

        errorMsg,
        pageName: "Shopping Cart",
        products: null,
      });
    }
    // return res.send("hi");
    req.session.cart.coupon=null;
    req.session.cart.pricedrop=0;
    req.session.cart.discountAmount=req.session.cart.totalCost;
   console.log(req.session.cart,"huhihundnj")  
    for(shippingcharges of shippingcharge){
      if(req.session.cart.totalCost<shippingcharges.cartsize){
         charge=shippingcharges.shipping_charge;
         break;
      }
    }
    let products=await productsFromCart(req.session.cart);
    for(item of products){
      if(!item.available){
         status=false;
           break;   
           }
    }
    return res.render("shop/shopping-cart", {
      cart: req.session.cart,
      pageName: "Shopping Cart",
      csrfToken:req.csrfToken(),

      errorMsg,
      products,
      charge,
      status,
      pricedrop,
      total:charge+req.session.cart.totalCost-pricedrop
    });
  } catch (err) {
    console.log(err.message);
    res.redirect("/");
  }
});
// get requests of fail and successful payments
// router.get("/fail", async (req, res) => {
//   req.flash("error","Payment Failed");

//   res.setHeader("Location", "http://localhost:3000/shopping-cart");
  
//   // res.redirect("/shopping-cart");
// });





router.get("/success", async (req, res) => {
  const user = req.user;
  const maildata = {
    cart :req.session.cart,
    user,
    paymentId: req.query.txnid,
  };
  sendmail(maildata);
  const order =  new Order({
    user: req.user,
    cart: {
      totalQty: req.session.cart.totalQty,
      totalCost: req.session.cart.discountAmount,
      items: req.session.cart.items,
      totalcodprepaid:0,
    },
    orderType : "PREPAID",
    address: req.query.address,
    paymentId: req.query.paymentId,
  });
   order.save(async (err, newOrder) => {
    if (err) {
      console.log(err);
      return res.redirect("/checkout");
    }

    const query = { user: req.user._id };
   Cart.remove(query, function (err, obj) {
      if (err) throw err;
    });
  });

  res.redirect(
    url.format({
      pathname: "/",
      query: {
        statuscheck: "true",
      },
    })
  );
});
// get routes of COD pages
router.get("/codsuccess", async (req, res) => {
  const user = req.user;
  const maildata = {
    cart:req.session.cart,
    user,
    paymentId: req.query.txnid,
  };
  sendmail(maildata);
  const order =  new Order({
    user: req.user,
    cart: {
      totalQty: req.session.cart.totalQty,
      totalCost: req.session.cart.discountAmount,
      items: req.session.cart.items,
      totalcodprepaid:0,
    },
    orderType:"COD",
    address: req.query.address,
    paymentId: req.query.paymentId,
  });
   order.save(async (err, newOrder) => {
    if (err) {
      console.log(err);
      return res.redirect("/checkout");
    }

    const query = { user: req.user._id };
   Cart.remove(query, function (err, obj) {
      if (err) throw err;
      // Cart.close();
    });
  });
  res.redirect(
    url.format({
      pathname: "/",
      query: {
        statuscheck: "true",
      },
    })
  );
});
router.get("/codfail", async (req, res) => {
 
  req.flash("error","Payment Failed");
  
  res.redirect("/shopping-cart");

});

router.get("/codprepaidsuccess", async (req, res) => {
  console.log("anillllll",req.session.cart)
  const user = req.user;
  // const cart = await Cart.findById(req.session.cart._id);
  const maildata = {
    cart:req.session.cart,
    user,
    paymentId: req.query.txnid,
  };
   sendmail(maildata);
  // console.log("null",cart)
  const order =  new Order({
    user: req.user,
    cart: {
      totalQty: req.session.cart.totalQty,
      totalCost: req.session.cart.discountAmount,
      totalcodprepaid: req.session.cart.totalcodprepaid,
      items: req.session.cart.items,
    },
    orderType : "COD",
    address: req.query.address,
    paymentId: req.query.paymentId,
  });
   order.save(async (err, newOrder) => {
    if (err) {
      console.log(err);
      return res.redirect("/checkout");
    }

    const query = { user: req.user._id };
    Cart.remove(query, function (err, obj) {
      if (err) throw err;
     
    });
  });
  res.redirect(
    url.format({
      pathname: "/",
      query: {
        statuscheck: "true",
      },
    })
  );
});
router.get("/codprepaidfail", async (req, res) => {
   req.flash("error","Payment Failed");
 
   res.redirect("/shopping-cart");
 
});
// get routes of consultant payments
router.get("/consultfail", async (req, res) => {
 
  
  res.render("/", {
    status: req.query.status,
  });
});
router.get("/consultsuccess", async (req, res) => {
  const consultant = new Consultant({
    name: req.query.name,
    number: req.query.number,
    timeslot: req.query.timeslot,
    email: req.query.email,
    problemtype: req.query.ptype,
    status: "pending",
    user : req.user,
  });
  consultant.save((err, newConsultant) => {
    if (err) {
      console.log(err);
      return res.redirect("/");
    } else {
    }
  });
  res.redirect("/user/profile");
});

// GET: reduce one from an item in the shopping cart
router.get("/reduce/:id", async function (req, res) {
  // if a user is logged in, reduce from the user's cart and save
  // else reduce from the session's cart
  const productId = req.params.id;
  let cart;
  try {
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id });
    } else if (req.session.cart) {
      cart = await new Cart(req.session.cart);
    }

    // find the item with productId
    let itemIndex = cart.items.findIndex((p) => p.productId == productId);
    if (itemIndex > -1) {
      // find the product to find its price
      const product = await Product.findById(productId);
      // if product is found, reduce its qty
      cart.items[itemIndex].qty--;
      cart.items[itemIndex].price -= product.price;
      cart.items[itemIndex].codprepaid -= product.codprepaid;
      cart.totalQty--;
      cart.totalCost -= product.price;
      cart.totalcodprepaid -= product.codprepaid;
      // if the item's qty reaches 0, remove it from the cart
      if (cart.items[itemIndex].qty <= 0) {
        await cart.items.remove({ _id: cart.items[itemIndex]._id });
      }
      req.session.cart = cart;
      //save the cart it only if user is logged in
      if (req.user) {
        await cart.save();
      }
      //delete cart if qty is 0
      if (cart.totalQty <= 0) {
        req.session.cart = null;
        await Cart.findByIdAndRemove(cart._id);
      }
    }
    // res.redirect(req.headers.referer);
    res.send({ data: cart.totalQty });
  } catch (err) {
    console.log(err.message);
    res.redirect("/");
  }
});

//decrease cart item qty
router.get("/decrease/:id", async function (req, res, next) {
  // if a user is logged in, reduce from the user's cart and save
  // else reduce from the session's cart
  const productId = req.params.id;
  let cart;
  try {
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id });
    } else if (req.session.cart) {
      cart = await new Cart(req.session.cart);
    }

    // find the item with productId
    let itemIndex = cart.items.findIndex((p) => p.productId == productId);
    if (itemIndex > -1) {
      // find the product to find its price
      const product = await Product.findById(productId);
      // if product is found, reduce its qty
      cart.items[itemIndex].qty--;
      cart.items[itemIndex].price -= product.price;
      cart.items[itemIndex].codprepaid -= product.codprepaid;
      cart.totalQty--;
      cart.totalCost -= product.price;
      cart.totalcodprepaid -= product.codprepaid;
      cart.discountAmount -= cart.totalCost 


      // if the item's qty reaches 0, remove it from the cart
      if (cart.items[itemIndex].qty <= 0) {
        await cart.items.remove({ _id: cart.items[itemIndex]._id });
      } else {
        req.session.cart = cart;
      }
      // req.session.cart = cart;
      //save the cart it only if user is logged in
      if (req.user) {
        await cart.save();
      }
      // console.log("outafter", req.session.cart, "outafter mg", cart);

      //delete cart if qty is 0
      if (cart.totalQty <= 0) {
        // console.log("before", req.session.cart, "before mg", cart);

        req.session.cart = null;

        await Cart.deleteOne({ _id: cart._id });
        res.redirect("/shopping-cart");
        // console.log("after", req.session.cart, "after mg", cart);
      }
    }
    res.redirect(req.headers.referer);
    // res.send({ data: cart.totalQty });
  } catch (err) {
    console.log(err.message);
    res.redirect("/");
  }
});

// GET: remove all instances of a single product from the cart
router.get("/removeAll/:id", async function (req, res, next) {
  const productId = req.params.id;
  let cart;
  try {
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id });
    } else if (req.session.cart) {
      cart = await new Cart(req.session.cart);
    }
    //fnd the item with productId
    let itemIndex = cart.items.findIndex((p) => p.productId == productId);
    if (itemIndex > -1) {
      //find the product to find its price
      cart.totalQty -= cart.items[itemIndex].qty;
      cart.totalCost -= cart.items[itemIndex].price;
      cart.totalcodprepaid -= cart.items[itemIndex].codprepaid;
      await cart.items.remove({ _id: cart.items[itemIndex]._id });
    }
    req.session.cart = cart;

    //save the cart it only if user is logged in
    if (req.user) {
      await cart.save();
    }

    //delete cart if qty is 0
    if (cart.totalQty <= 0) {
      req.session.cart = null;

      await Cart.findByIdAndRemove(cart._id);
    }
    res.redirect(req.headers.referer);
  } catch (err) {
    console.log(err.message);
    res.redirect("/");
  }
});

router.get("/directcheckout",async (req,res)=>{
  if(req.session.cart!=null){
    let products=await productsFromCart(req.session.cart);
    for(item of products){
      if(!item.available){
       return res.redirect("/shopping-cart");  
           }
    }
 var cart = await Cart.findById(req.session.cart._id).populate("items.productId").populate("user");
    cart.discountAmount = req.session.cart.totalCost;
    cart.pricedrop= 0;
    cart.coupon= null;
    await cart.save()
    req.session.cart.discountAmount=req.session.cart.totalCost;
    req.session.cart.pricedrop= 0;
    req.session.cart.coupon= null;
    res.redirect(
"/checkout"
    )
  }
})

// GET: checkout form with csrf token
router.get("/checkout", middleware.isLoggedIn, async (req, res) => {
  // if(req.query.statuscheck!="true"){
  //   return res.redirect("/shopping-cart");
    
  // }
  const errorMsg = req.flash("error")[0];
 

  if (!req.session.cart) {
    return res.redirect("/shopping-cart");
  }
  console.log(req.session.cart)
  let products=await productsFromCart(req.session.cart);
  for(item of products){
    if(!item.available){
     return res.redirect("/shopping-cart");  
         }
  }
  const shippingcharge=await Shippingcharge.find({});
console.log(shippingcharge);
var charge=0;
  //load the cart with the session's cart's id from the db
 var cart = await Cart.findById(req.session.cart._id).populate("items.productId").populate("user");
//  console.log(cart);
 for(shippingcharges of shippingcharge){
  if(req.session.cart.totalCost<shippingcharges.cartsize){
     charge=shippingcharges.shipping_charge;
     break;
  }
}
  const errMsg = req.flash("error")[0];

  var producttitle = cart.items.map((data) => {
    return data.title;
  });
  var productqty = cart.items.map((data) => {
    return data.qty;
  });
  var productprice = cart.items.map((data) => {
    return data.price;
  });
  var amount_to_pay_cod = cart.discountAmount- cart.totalcodprepaid;
  res.render("shop/payumoneyForm", {
    cart,
    amount_to_pay_cod,
    total: cart.totalCost,
    csrfToken: req.csrfToken(),
    productqty,
    productprice,
    errorMsg,
    producttitle,
    charge,
    discountAmount:cart.discountAmount,
    pricedrop:cart.pricedrop,
    pageName: "Checkout",
  });
});

// POST: handle checkout logic and payment using Stripe

router.get("/consultcheckout",middleware.isLoggedIn, async (req, res) => {
  var currentdate = new Date(); 
 
  var datetime =  + currentdate.getDate() + "/"
                  + (currentdate.getMonth()+1)  + "/" 
                  + currentdate.getFullYear()   
                 
  
    
                  var time =  currentdate.getHours() + ":"  
                  + currentdate.getMinutes() + ":" 
                  + currentdate.getSeconds();
                  console.log("date",datetime , time)
    const freeConsult_enddate = await Freeconsult_endDate.find({});
    var check_time =null;
  console.log(currentdate.getHours() )
  // currentdate.getHours()<=freeConsult_enddate[0].freeConsult_endtime
    
  if(currentdate.getDate()<=freeConsult_enddate[0].freeConsult_enddate.split("/")[0]&&currentdate.getMonth()+1<=freeConsult_enddate[0].freeConsult_enddate.split("/")[1]&&currentdate.getFullYear() <=freeConsult_enddate[0].freeConsult_enddate.split("/")[2] ){
      check_time =freeConsult_enddate[0].freeConsult_enddate;
  console.log("in",check_time)

  }
  console.log("out",check_time)
  res.render("shop/consult", {
    check_time,
    email : req.user.email,
    pageName: "consultcheckout",
    csrfToken: req.csrfToken(),
  });
});

//GET :wishlist
router.get("/wishlist", async (req, res) => {
  const products = await Product.find({})
    .sort("-createdAt")
    .populate("category");

  const productId = "608e3afba5f4c4617cdb2b1d";
  const product = await Product.findById(productId);

  res.render("shop/wishlist", {
    pageName: "WishList",
    products,
  });
});

router.get("/sidenav-shopping-cart", async (req, res) => {
  try {
    var status=true;
    // find the cart, whether in session or in db based on the user state
    let cart_user;
    if (req.user) {
      cart_user = await Cart.findOne({ user: req.user._id });
    }
    // if user is signed in and has cart, load user's cart from the db
    if (req.user && cart_user) {
      req.session.cart = cart_user;
      let products=await productsFromCart(cart_user);
      for(item of products){
        if(!item.available){
           status=false;
             break;   
             }
      }
      return res.send({
        cart: cart_user,
        products,
        status
      });
    }

    // if there is no cart in session and user is not logged in, cart is empty
    if (!req.session.cart) {
      return res.send({
        cart: null,
        products: null,
      });
    }
    let products=await productsFromCart(req.session.cart);
    for(item of products){
      if(!item.available){
         status=false;
           break;   
           }
    }
    // otherwise, load the session's cart
    return res.send({
      cart: req.session.cart,
      products,
      status
    });
  } catch (err) {
    console.log(err.message);
    res.redirect("/");
  }
});

// create products array to store the info of each product in the cart
async function productsFromCart(cart) {
  let products = []; // array of objects
  for (const item of cart.items) {
    let foundProduct = (
      await Product.findById(item.productId)
        .populate("category.MainCategory")
        .populate("category.Subcategories.Parent_Subcategory")
        .populate("category.Subcategories.Child_Subcategory")
    ).toObject();
    foundProduct["qty"] = item.qty;
    foundProduct["totalPrice"] = item.price;
    products.push(foundProduct);
  }
  return products;
}

module.exports = router;
