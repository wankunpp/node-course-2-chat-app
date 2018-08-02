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
  },
  firstName:{
    type: String,
    default:'-'
  },
  lastName: {
    type: String,
    default: '-'
  },
  userImage: {
    type: String,
    default: '/files/default-avatar.jpg'
  },
  friendsList: [
    {
    friendId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
    }
  ],
  friendRequest:[
    {
      from:{type:mongoose.SchemaTypes.ObjectId, ref:'User'}
    }
  ],
  messages:[
    {
      from:{type: mongoose.SchemaTypes.ObjectId, ref: 'User'},
      amount: {type: Number, default: 1},
      type:{type: String, default: "privateMessage"}
    }
  ]
});

UserSchema.methods.toJSON = function(){
  const user = this;
  const userObject = user.toObject();

  return _.omit(userObject,['password']);
}

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
