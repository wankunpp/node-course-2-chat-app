const express = require("express");
const router = express.Router();
const {passport} = require('../config/passport');
const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const path = require('path');
const fs = require('fs');

const {User} = require('../models/user');

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

const s3 = new aws.S3();

const storage = multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    metadata: function(req, file, cb){
      cb(null, {fieldName: file.fieldname})
    },
    key: function(req, file, cb){
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });
// }else{
//   storage = multer.diskStorage({
//     destination:'./public/uploads/',
//     filename: function(req, file, cb){
//       cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//     }
//   });
// }

const upload = multer({
  storage: storage,
  limits: {
            fileSize: 3000000,
          }
});

router.get("/me", passport.authenticate('jwt',{
  session:false,
  failureRedirect: '/',
  failureFlash: true
}),(req,res) => {
  res.render('user-profile',{user : req.user});
});

router.post("/me", passport.authenticate('jwt',{
  session:false,
  failureRedirect: '/',
  failureFlash: true
}),upload.single('form__image'),(req,res) =>{
  User.findByIdAndUpdate(req.user._id, {
    $set: {
      firstName: req.body.firstName.trim(),
      lastName: req.body.lastName.trim(),
      userImage: `https://s3.us-east-2.amazonaws.com/${req.file.bucket}/${req.file.key}`
    }
  }).then(user => {
    res.redirect('/user-profile/me');
  })
})

// router.post("/me",passport.authenticate('jwt',{
//     session:false,
//     failureRedirect: '/',
//     failureFlash: true
// }),(req,res) =>{
//   upload(req,res, (err) =>{
//     if(err){
//       res.render('user-profile',{user: req.user, msg: err});
//     }else{
//       //if user upload a new image , delete the old one then update the database
//       if(req.file != undefined){
//         if(req.user.userImage !== '/files/default-avatar.jpg'){
//           const originalImage = path.join(__dirname,'..','public',req.user.userImage);
//           fs.unlink(originalImage,(err) => {
//             if (err) res.redirect('404');
//           });
//         }
//         User.findByIdAndUpdate(req.user._id,
//           {
//            $set: { 
//                     firstName: req.body.firstName.trim() , 
//                     lastName: req.body.lastName.trim(),
//                     // userImage: '/uploads/'+req.file.filename ,
//                     userImage: req.file.filename
//                   }
//           }).then(user => {
//                 res.redirect('/user-profile/me');
//           })
//       }else{
//         User.findByIdAndUpdate(req.user._id, 
//             {
//               $set: {
//                 firstName: req.body.firstName.trim(),
//                 lastName: req.body.lastName.trim()
//               }
//             }).then( user => {
//               res.redirect('/user-profile/me');
//             })
//       }
//     }
//   })
  
// })

router.get("/:userId", passport.authenticate('jwt',{
  session:false,
  failureRedirect: '/',
  failureFlash: true
}),(req,res) => {
  const userId = req.params.userId;
  User.findById(userId).then(viewUser =>{
  res.render('user-profile', {user: req.user, viewUser: viewUser})
  });
})

module.exports = router;