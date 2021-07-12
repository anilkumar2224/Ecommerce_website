const express = require("express");
const csrf = require("csurf");
const Product = require("../models/product");
const Category = require("../models/category");
const Cart = require("../models/cart");
const Order = require("../models/order");
const middleware = require("../middleware");
const router = express.Router();
const csrfProtection = csrf();
router.use(csrfProtection);
const cryptoJs = require("crypto-js");
const jssha = require("jssha");
const bodyParser = require("body-parser");
const request = require("request");
const { rawListeners } = require("../app");

const SALT = process.env.SALT;
const MERCHANT_KEY = process.env.MERCHANT_KEY;

function genTxnid() {
  const d = new Date();
  let gentxnid = cryptoJs.SHA256(
    Math.floor(Math.random() * 10 + 1).toString() + d.getTime().toString()
  );
  return "v" + gentxnid.toString().substr(0, 20);
}
router.use(bodyParser.urlencoded({ extended: false }));
router.post("/payumoney", (req, res) => {
  req.body.txnid = genTxnid();
  //Here pass txnid and it should be different

  // req.body.firstname = req.user.firstname;
  //Here save all the details in pay object
  const pay = req.body;
  if (req.body.udf5 == "COD") {
    const hashString =
    MERCHANT_KEY + //store in in different file
    "|" +
    pay.txnid +
    "|" +
    pay.codprepaid +
    "|" +
    pay.productinfo +
    "|" +
    pay.firstname +
    "|" +
    pay.email +
    "|" +
    pay.udf1 +
    "|" +
    pay.udf2 +
    "|" +
    pay.udf3 +
    "|" +
    pay.udf4 +
    "|" +
    pay.udf5 +
    "|" +
    "|||||" +
    SALT; //store in in different file
  const sha = new jssha("SHA-512", "TEXT");
  sha.update(hashString);
  //Getting hashed value from sha module
  const hash = sha.getHash("HEX");

 
  //We have to additionally pass merchant key to API so remember to include it.
  pay.key = MERCHANT_KEY; //store in in different file;
 
  pay.hash = hash;
  // console.log(req.body);
  
  //Making an HTTP/HTTPS call with request
  // console.log(req.body);
 


if(req.body.codprepaid==0){
  console.log("rq",req.session)

  const data = {
    key: pay.key,
    hash: pay.hash,
    txnid: req.body.txnid,
    email: req.body.email,
    productinfo: req.body.productinfo,
    service_provider: "payu_paisa",
    amount: req.session.cart.discountAmount,
    surl: process.env.HOST_URL+"/codsuccess",
    udf1: req.body.udf1,
    udf2: req.body.udf2,
    udf3: req.body.udf3,
    firstname: req.body.firstname,
    address1: req.body.state,

    lastname: req.body.lastname,
    city: req.body.city,
    country: "India",
    udf4: req.body.udf4,
    zipcode: req.body.zip,
    phone: req.body.phone,
  };

  request.post(
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      url: process.env.HOST_URL+"/codsuccess", //Production  url
      form: data,
    },

    function (error, httpRes, body) {
      if (error) res.send({ status: false, message: error.toString() });
      if (httpRes.statusCode === 200) {
        console.log("hi bae");
        res.send(body);
      } else if (httpRes.statusCode >= 300 && httpRes.statusCode <= 400) {
        res.redirect(httpRes.headers.location.toString());
      }
    }
  );
}
else{
  console.log("rq",req.session)

  const data = {
    key: pay.key,
    hash: pay.hash,
    txnid: req.body.txnid,
    email: req.body.email,
    productinfo: req.body.productinfo,
    service_provider: "payu_paisa",
    amount: req.session.cart.totalcodprepaid,
    state:req.body.state,
    surl: process.env.HOST_URL+"/codprepaidsuccess",
    udf1: req.body.udf1,
    udf2: req.body.udf2,
    udf3: req.body.udf3,
    udf4: req.body.udf4,
    udf5: req.body.udf5,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    city: req.body.city,
    address1: req.body.state,
    address2:req.body.state,
    country: "India",
    zipcode: req.body.zip,
    phone: req.body.phone,
  };
console.log("bhanu",data)
    request.post(
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        url: "https://secure.payu.in/_payment", //Production  url
        form: data,
      },

      function (error, httpRes, body) {
        if (error) res.send({ status: false, message: error.toString() });
        if (httpRes.statusCode === 200) {
          console.log("hi bae");
          res.send(body);
        } else if (httpRes.statusCode >= 300 && httpRes.statusCode <= 400) {
          res.redirect(httpRes.headers.location.toString());
        }
      }
    );

    }

  } else if (req.body.udf5 == "OTHER") {
    console.log("rq",req.session)
    const hashString =
    MERCHANT_KEY + //store in in different file
    "|" +
    pay.txnid +
    "|" +
    req.session.cart.discountAmount +
    "|" +
    pay.productinfo +
    "|" +
    pay.firstname +
    "|" +
    pay.email +
    "|" +
    pay.udf1 +
    "|" +
    pay.udf2 +
    "|" +
    pay.udf3 +
    "|" +
    pay.udf4 +
    "|" +
    pay.udf5 +
    "|" +
   
    "|||||" +
    SALT; //store in in different file
  const sha = new jssha("SHA-512", "TEXT");
  sha.update(hashString);
  //Getting hashed value from sha module
  const hash = sha.getHash("HEX");

  console.log(
    "from payment                                                                    .                   page",
    req.session.cart
  );

  //We have to additionally pass merchant key to API so remember to include it.
  pay.key = MERCHANT_KEY; //store in in different file;
  // pay.surl = "http://localhost:3000/success";
  // pay.furl = "http://localhost:3000/fail";
  pay.hash = hash;
  console.log(req.body);
  
  //Making an HTTP/HTTPS call with request
  // console.log(req.body);
  const data = {
    key: pay.key,
    hash: pay.hash,
    txnid: req.body.txnid,
    email: req.body.email,
    productinfo: req.body.productinfo,
    service_provider: "payu_paisa",
    amount: req.session.cart.discountAmount,
    surl: process.env.HOST_URL+"/success",
    udf1: req.body.udf1,
    udf2: req.body.udf2,
    udf3: req.body.udf3,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    address1: req.body.state,

    city: req.body.city,
    country: "India",
    udf4: req.body.udf4,
    udf5: req.body.udf5,
    zipcode: req.body.zip,
    phone: req.body.phone,
  };

    request.post(
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        url: "https://secure.payu.in/_payment", //Production  url
        form: data,
      },

      function (error, httpRes, body) {
        if (error) res.send({ status: false, message: error.toString() });
        if (httpRes.statusCode === 200) {
          console.log("hi bae");
          res.send(body);
        } else if (httpRes.statusCode >= 300 && httpRes.statusCode <= 400) {
          res.redirect(httpRes.headers.location.toString());
        }
      }
    );
  }
});


// refund route for cancelled payments
router.post("/refund", (req, res) => {
  var options = {
    method: "POST",
    url: "https://www.payumoney.com/treasury/merchant/refundPayment?paymentId=433528388&refundAmount=1",
    headers: {
      "Content-Type": "application/json",
      Authorization: "ABByfclgPR950haYhafo+e1ukouEccUOntnUprfujsg=",
    },
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
  });

  // var datarefund = {
  //   paymentId: req.body.trackid,
  //   merchantKey: MERCHANT_KEY,
  //   refundAmount: "1",
  // };
  // console.log(datarefund);

  // request.get(
  //   {
  //     headers: {
  //       Accept: "application/json",
  //       "Content-Type": "application/json",
  //       Authorization: "Bearer ABByfclgPR950haYhafo+e1ukouEccUOntnUprfujsg=",
  //     },
  //     url: "https://www.payumoney.com/payment/merchant/refundPayment?", //Testing url
  //     form: datarefund,
  //   },
  // function (err, res) {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     console.log(res.body);
  //   }
  // }
  // function (error, httpRes, body) {
  //   if (error) res.send({ status: false, message: error.toString() });
  //   if (httpRes.statusCode === 200) {
  //     console.log(body);
  //     res.send(body);
  //   } else if (httpRes.statusCode >= 300 && httpRes.statusCode <= 400) {
  //     res.redirect(httpRes.headers.location.toString());
  //   }
  // }
});
module.exports = router;
