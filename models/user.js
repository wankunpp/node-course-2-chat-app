const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const _ = require('lodash');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  }
});

UserSchema.methods.toJSON = function(){
  const user = this;
  const userObjdect = user.toObject();

  return _.pick(userObjdect,['_id','name','email']);
}

UserSchema.statics.findByUsername = function(username, password) {
  const User = this;

  return User.findOne({ username }).then(user => {
    if (!user) return Promise.reject();
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) resolve(user);
        reject(err);
      });
    });
  });
};

UserSchema.pre("save", function(next) {
  const user = this;

  if (user.isModified("password")) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

const User = mongoose.model("User", UserSchema);

module.exports = { User };
