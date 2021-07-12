var Mailgen = require("mailgen");
const { google } = require('googleapis');

const nodemailer = require("nodemailer");
const log = console.log;
const CLIENT_ID = process.env.YOUR_CLIENT_ID;
const CLEINT_SECRET =  process.env.YOUR_CLIENT_SECRET;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN =  process.env.YOUR_REFRESH_TOKEN;


const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLEINT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

module.exports = async  function (e) {
  const accessToken = await oAuth2Client.getAccessToken();
  var transporter = nodemailer.createTransport({

    service: "gmail",
    auth: {
      user: process.env.FROM_EMAIL,// email
      type: 'OAuth2',
      clientId: CLIENT_ID,
      clientSecret: CLEINT_SECRET,
      refreshToken: REFRESH_TOKEN,
      accessToken: accessToken,
    },
  });

  // Configure mailgen by setting a theme and your product info
  var mailGenerator = new Mailgen({
    theme: "default",
    product: {
      // Appears in header & footer of e-mails
      name: "BRUH INDIA INVITATION",
      link: "https://pure-spire-67467.herokuapp.com/",
      // Optional logo
      // logo: 'https://mailgen.js/img/logo.png'
    },
  });

  // Prepare email contents
  var email = {
    body: {
      name: e.smconsultant.name,
      intro: "Meet our Doctor by joing the meet now ",
      //   intro: "Your",
      table: {
        data: {},
        columns: {
          // Optionally, customize the column widths
          customWidth: {
            item: "20%",
            price: "15%",
          },
          // Optionally, change column text alignment
          customAlignment: {
            price: "right",
          },
        },
      },
      action: {
        instructions:
          "You can check the status of your order and more in your dashboard:",
        button: {
          color: "#3869D4",
          text: "Join the Meet",
          link: "https://meet.google.com/vry-vcve-ujt",
        },
      },
      outro: "We thank you for your purchase.",
    },
  };

  // Generate an HTML email with the provided contents
  var emailBody = mailGenerator.generate(email);

  // Generate the plaintext version of the e-mail (for clients that do not support HTML)
  var emailText = mailGenerator.generatePlaintext(email);

  // Optionally, preview the generated HTML e-mail by writing it to a local file
  require("fs").writeFileSync("preview.html", emailBody, "utf8");
  require("fs").writeFileSync("preview.txt", emailText, "utf8");

  await transporter.sendMail(
    {
      from: e.smdoctor.email, // doctor email
      to: e.smconsultant.email,
      subject: "Mailgen",
      html: emailBody,
      text: emailText,
    },
    function (err) {
      if (err) return console.log(err);
      console.log("Message sent successfully.");
    }
  );
};
