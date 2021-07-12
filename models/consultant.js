const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const consultantSchema = Schema({
  user: {
    type: Schema.Types.ObjectId,
    // type: {},
    ref: "User",
  },
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  number: {
    type: String,
    require: true,
  },
  timeslot: {
    type: String,
    require: true,
  },
  problemtype: {
    type: String,
    require: true,
  },
  status: {
    type: String,
    require: true,
  },
});

module.exports = mongoose.model("Consultant", consultantSchema);
