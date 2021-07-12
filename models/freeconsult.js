const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const freeconsultSchema = Schema({
  freeConsult_enddate: {
    type: String,
    require: true,
  },
 
});



module.exports = mongoose.model("Freeconsult_endDate", freeconsultSchema);
  // freeConsult_endtime: {
  //   type: Number,
  //   require: true,
  // },
