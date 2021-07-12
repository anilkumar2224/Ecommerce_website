const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");
const Schema = mongoose.Schema;

const doctorSchema = Schema({
  type: {
    type: Array,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
});

// encrypt the password before storing
doctorSchema.methods.encryptPassword = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

doctorSchema.methods.validPassword = function (candidatePassword) {
  if (this.password != null) {
    return bcrypt.compareSync(candidatePassword, this.password);
  } else {
    return false;
  }
};

module.exports = mongoose.model("Doctor", doctorSchema);
