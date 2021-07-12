const express = require("express");
const csrf = require("csurf");
const Freeconsult_endDate = require("../models/freeconsult");

const router = express.Router();
const bodyParser = require("body-parser");
const cryptoJs = require("crypto-js");
const jssha = require("jssha");
const request = require("request");
const SALT = "Z0XP5PCl14";
const MERCHANT_KEY = "QgZza11T";
const csrfProtection = csrf();
router.use(csrfProtection);
function genTxnid() {
  const d = new Date();
  let gentxnid = cryptoJs.SHA256(
    Math.floor(Math.random() * 10 + 1).toString() + d.getTime().toString()
  );
  return "v" + gentxnid.toString().substr(0, 20);
}


router.use(bodyParser.urlencoded({ extended: false }));



router.post("/payu", async (req, res) => {
  var currentdate = new Date(); 
  var datetime =  + currentdate.getDate() + "/"
                  + (currentdate.getMonth()+1)  + "/" 
                  + currentdate.getFullYear()   
                 
  
    
                  var time =  currentdate.getHours() + ":"  
                  + currentdate.getMinutes() + ":" 
                  + currentdate.getSeconds();
                  console.log("date",datetime , time)
 
    const freeConsult_enddate = await Freeconsult_endDate.find({});
  
  
    console.log("hi",freeConsult_enddate[0].freeConsult_enddate)
    // &&currentdate.getHours()<=freeConsult_enddate[0].freeConsult_endtime
     if(currentdate.getDate()<=freeConsult_enddate[0].freeConsult_enddate.split("/")[0]&&currentdate.getMonth()+1<=freeConsult_enddate[0].freeConsult_enddate.split("/")[1]&&currentdate.getFullYear() <=freeConsult_enddate[0].freeConsult_enddate.split("/")[2] ){
  const pay = req.body;
     
    
      const data = {
        txnid: req.body.txnid,
        email: req.body.email,
        productinfo: req.body.productinfo,
        service_provider: "payu_paisa",
        amount: req.body.amount,
        udf1: pay.udf1,
        udf2: pay.udf2,
        surl: process.env.HOST_URL+"/consultsuccess",
        // udf1: "testing",
        firstname: req.body.firstname,
        // lastname: "prakash",
        phone: req.body.number,
      };
    await  request.post(
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          url: process.env.HOST_URL+"/consultsuccess", //Production  url
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
     }else{

  req.body.txnid = genTxnid();
  const pay = req.body;
  const hashString =
    MERCHANT_KEY + //store in in different file
    "|" +
    pay.txnid +
    "|" +
    pay.amount +
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
    "||||||||" +
    SALT; //store in in different file
  const sha = new jssha("SHA-512", "TEXT");
  sha.update(hashString);
  //Getting hashed value from sha module
  const hash = sha.getHash("HEX");
  pay.key = MERCHANT_KEY; //store in in different file;
  pay.surl = process.env.HOST_URL+"/consultsuccess";
  pay.furl =  process.env.HOST_URL+"/consultfail";
  pay.hash = hash;
  //   console.log(pay);

  const data = {
    key: pay.key,
    hash: pay.hash,
    txnid: req.body.txnid,
    email: req.body.email,
    productinfo: req.body.productinfo,
    service_provider: "payu_paisa",
    amount: req.body.amount,
    udf1: pay.udf1,
    udf2: pay.udf2,
    surl: process.env.HOST_URL+"/consultsuccess",
    // udf1: "testing",
    firstname: req.body.firstname,
    // lastname: "prakash",
    phone: req.body.number,
  };

 await request.post(
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      url: "https://secure.payu.in/_payment", //Production url
      form: data,
    },

    function (error, httpRes, body) {
      if (error) res.send({ status: false, message: error.toString() });
      if (httpRes.statusCode === 200) {
        // console.log(body);
        res.send(body);
      } else if (httpRes.statusCode >= 300 && httpRes.statusCode <= 400) {
        res.redirect(httpRes.headers.location.toString());
      }
    }
  );
     }
});

module.exports = router;
