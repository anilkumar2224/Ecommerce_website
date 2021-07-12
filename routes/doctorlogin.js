const express = require("express");
const Doctor = require("../models/doctor");
const url = require("url");
const DoctorSendMail = require("./doctorsendmail");
const Consultant = require("../models/consultant");
const router = express.Router();
const bodyParser = require("body-parser");
var passport = require("passport");
const csrf = require("csurf");
const csrfProtection = csrf();
router.use(csrfProtection);
router.use(bodyParser.urlencoded({ extended: false }));
router.get("/login", (req, res) => {
  var errorMsg = req.flash("error")[0];

  res.render("./shop/doctorlogin", {
    csrfToken: req.csrfToken(),
    errorMsg,
    pageName: "Doctor Sign In",
  });
});

router.post(
  "/login/success",
  [
    passport.authenticate("local.dsignin", {
      failureRedirect: "/doctor/login",
      failureFlash: true,
    }),
  ],
  async (req, res) => {
    const doctor = await Doctor.find({ email: req.body.email });
    console.log(doctor[0])
    const consultants = await Consultant.find().where("problemtype").in(doctor[0].type).exec();;
    console.log("to doctor panl", consultants);
    res.render("shop/doctorpanel.ejs", {
      csrfToken: req.csrfToken(),
      consultants,
      doctor,
    });
  }
);
// updating the status of consultants
router.post("/update", (req, res) => {
  console.log(req.body);
  const filter = { _id: req.body.cid };
  const update = { status: "completed" };
  Consultant.findOneAndUpdate(filter, update, (err, res) => {
    if (err) {
      console.log(err);
    } else {
      console.log(res);
    }
  });
  res.send("hi");
});
// sending mail to the consultants
router.post("/sendmail", async (req, res) => {
  const smconsultant = await Consultant.findById(req.body.cid);
  const demail = req.body.demail;
  const smdoctor = await Doctor.find({ email: demail });
  const maildata = {
    smconsultant,
    smdoctor,
  };
  DoctorSendMail(maildata);

  res.send("hi");
});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/doctor/login");
});
module.exports = router;
